import Image from "next/image"

interface WelcomeScreenProps {
  userName?: string
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="text-center max-w-2xl w-full px-8">
        <div className="mb-12">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6">
            <Image src="/icons/logo_clara_azul.svg" alt="Clara Logo" width={60} height={60} />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-3">¡Hola, {userName}!</h2>
          <p className="text-xs text-primary text-lg mb-2">
            Soy CLARA, tu asistente de IA especializado en estrategia de marca <br /> y marketing
          </p>
          <p className="text-muted-foreground text-base">¿En qué puedo ayudarte hoy?</p>
        </div>
      </div>
    </div>
  )
}
