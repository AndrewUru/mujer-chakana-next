"use client";

import Particles from "react-tsparticles";

export default function EstrellasFondo() {
  return (
    <div className="w-full h-screen">
      <Particles
        id="tsparticles"
        style={{
          width: "100%",
          height: "100%",

          aspectRatio: "auto", // 👈 ¡Esto elimina el ratio forzado!
        }}
        options={{
          fullScreen: { enable: false },
          background: {
            color: "transparent",
          },
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: {
              value: ["#ffffff", "#ffd700"],
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.8,
              random: true,
            },
            size: {
              value: { min: 2, max: 4 },
            },
            move: {
              enable: true,
              speed: 0.3,
              direction: "none",
              outModes: {
                default: "out",
              },
            },
          },
          emitters: [
            {
              direction: "top-right",
              rate: {
                quantity: 1,
                delay: 5,
              },
              size: {
                width: 0,
                height: 0,
              },
              position: {
                x: 0,
                y: 100,
              },
              particles: {
                color: {
                  value: "#ffffff",
                },
                move: {
                  speed: 2,
                  straight: true,
                  outModes: {
                    default: "destroy",
                  },
                },
                size: {
                  value: { min: 2, max: 4 },
                },
                opacity: {
                  value: 0.8,
                },
                life: {
                  duration: {
                    sync: true,
                    value: 3,
                  },
                },
              },
            },
          ],
          detectRetina: true,
        }}
      />
    </div>
  );
}
