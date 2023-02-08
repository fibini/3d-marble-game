import { RigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { useRef } from "react"

/**
 * Player
*/
export default function Player()
{
    // player movement
    const body = useRef()

    const [ subscribeKeys, getKeys] = useKeyboardControls()

    useFrame((state, delta) =>
    {
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 1 * delta
        const torqueStrngth = 1 * delta

        if(forward)
        {
            impulse.z -= impulseStrength
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
    >
        <mesh castShadow>
            <icosahedronGeometry args={ [0.3, 1] } />
            <meshStandardMaterial flatShading color="darkblue" />
        </mesh>
    </RigidBody>
    </>
}