import { useRapier, RigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useEffect, useRef } from "react"

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
            return () =>
            {
                unsubscribeJump()
            }
    }, [])

    useFrame((state, delta) =>
    {
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