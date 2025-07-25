
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: '#2a3441',
				input: '#2a3441',
				ring: '#7ED321',
				background: '#0B1426',
				foreground: '#FFFFFF',
				primary: {
					DEFAULT: '#0B1426',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#16213e',
					foreground: '#B8BCC8'
				},
				accent: {
					DEFAULT: '#7ED321',
					foreground: '#0B1426'
				},
				destructive: {
					DEFAULT: '#e3342f',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#16213e',
					foreground: '#B8BCC8'
				},
				popover: {
					DEFAULT: '#16213e',
					foreground: '#B8BCC8'
				},
				card: {
					DEFAULT: '#16213e',
					foreground: '#B8BCC8'
				},
				sidebar: {
					DEFAULT: '#16213e',
					foreground: '#B8BCC8',
					primary: '#0B1426',
					'primary-foreground': '#FFFFFF',
					accent: '#7ED321',
					'accent-foreground': '#0B1426',
					border: '#2a3441',
					ring: '#7ED321'
				},
				'deep-blue': '#0B1426',
				'emerald-green': '#7ED321',
				'amber-accent': '#7ED321',
				'soft-gray': '#B8BCC8',
				'charcoal': '#2a3441'
			},
			borderRadius: {
				lg: '8px',
				md: 'calc(8px - 2px)',
				sm: 'calc(8px - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
