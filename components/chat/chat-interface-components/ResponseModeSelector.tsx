"use client"

import { Zap, Scale, Target } from 'lucide-react'

interface ResponseModeSelectorProps {
    value: "quick" | "medium" | "advanced"
    onChange: (value: "quick" | "medium" | "advanced") => void
    disabled?: boolean
}

export function ResponseModeSelector({ value, onChange, disabled }: ResponseModeSelectorProps) {
    const modes = [
        { id: "quick" as const, label: "Rápido", icon: Zap, description: "Respuestas breves" },
        { id: "medium" as const, label: "Medio", icon: Scale, description: "Respuestas balanceadas" },
        { id: "advanced" as const, label: "Avanzado", icon: Target, description: "Respuestas detalladas" },
    ]

    return (
        <div className="flex items-center space-x-2">
            {modes.map((mode) => {
                const Icon = mode.icon
                const isActive = value === mode.id

                return (
                    <button
                        key={mode.id}
                        onClick={() => onChange(mode.id)}
                        disabled={disabled}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${isActive
                                ? "bg-primary text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        title={mode.description}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-medium">{mode.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
