import { useRapier, RigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useState, useEffect, useRef } from "react"
import * as THREE from 'three'

/**
 * Player
*/
export default function Player()
{
    // player movement
    const body = useRef()
    const [ subscribeKeys, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const rapierWorld = world.raw()

    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(0, 0, 10) )
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3() )

    const jump = () =>
    {
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        const hit = rapierWorld.castRay(ray, 10, true)

        if(hit.toi < 0.15)
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }

    useEffect(() =>
    {
        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) =>
            {
                if(value)
                    jump()
            })

            const unsubscribeAny = subscribeKeys(() =>
            {
                console.log('any key down')
            })
            return () =>
            {
                unsubscribeJump()
                unsubscribeAny()
            }
    }, [])

    useFrame((state, delta) =>
    {
        // controls
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrngth = 0.2 * delta

        if(forward)
        {
            impulse.z -= impulseStrength
            torque.x -= torqueStrngth
        }

        if(rightward)
        {
            impulse.x += impulseStrength
            torque.z -= torqueStrngth
        }

        if(backward)
        {
            impulse.z += impulseStrength
            torque.x += torqueStrngth
        }

        if(leftward)
        {
            impulse.x -= impulseStrength
            torque.z += torqueStrngth
        }
        
        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        // camera
        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 3
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraPosition, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)
    })

    return <>
    <RigidBody
        ref={ body }
        position={ [ 0, 1, 0 ] } 
        colliders="ball"
        restitution={ 0.2 }
        friction={ 1 }
        linearDamping={ 0.5 }
        angularDamping={ 0.5 }
    >
        <mesh castShadow>
            <icosahedronGeometry args={ [0.3, 1] } />
            <meshStandardMaterial flatShading color="darkblue" />
        </mesh>
    </RigidBody>
    </>
}