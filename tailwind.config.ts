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
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'Crimson Text', 'Georgia', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				heritage: {
					gold: 'hsl(var(--heritage-gold))',
					'gold-light': 'hsl(var(--heritage-gold-light))',
					'gold-dark': 'hsl(var(--heritage-gold-dark))',
					earth: 'hsl(var(--heritage-earth))',
					'earth-light': 'hsl(var(--heritage-earth-light))',
					sunset: 'hsl(var(--heritage-sunset))',
					'sunset-deep': 'hsl(var(--heritage-sunset-deep))',
					'sunset-light': 'hsl(var(--heritage-sunset-light))',
					forest: 'hsl(var(--heritage-forest))',
					'forest-light': 'hsl(var(--heritage-forest-light))',
					'forest-bright': 'hsl(var(--heritage-forest-bright))',
					sky: 'hsl(var(--heritage-sky))',
					'sky-deep': 'hsl(var(--heritage-sky-deep))',
					amber: 'hsl(var(--heritage-amber))',
					ruby: 'hsl(var(--heritage-ruby))',
					copper: 'hsl(var(--heritage-copper))',
					bronze: 'hsl(var(--heritage-bronze))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': 'calc(var(--radius) * 1.5)',
				'3xl': 'calc(var(--radius) * 2)'
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-hero-alt': 'var(--gradient-hero-alt)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-glass-gold': 'var(--gradient-glass-gold)',
				'gradient-forest': 'var(--gradient-forest)',
				'gradient-shimmer': 'var(--gradient-shimmer)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-sunset-glow': 'var(--gradient-sunset-glow)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'warm': 'var(--shadow-warm)',
				'glow': 'var(--shadow-glow)',
				'glow-intense': 'var(--shadow-glow-intense)',
				'intense': 'var(--shadow-intense)',
				'elevated': 'var(--shadow-elevated)',
				'premium': 'var(--shadow-premium)',
				'magnetic': 'var(--shadow-magnetic)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(20px)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-scale': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-50px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-10px) rotate(1deg)' },
					'75%': { transform: 'translateY(-5px) rotate(-1deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '1', 
						boxShadow: '0 0 30px hsl(var(--heritage-gold) / 0.4)' 
					},
					'50%': { 
						opacity: '0.9', 
						boxShadow: '0 0 60px hsl(var(--heritage-gold) / 0.7)' 
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.08)' },
					'70%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'magnetic-pull': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 20px hsl(var(--heritage-gold) / 0.5))'
					},
					'50%': { 
						filter: 'drop-shadow(0 0 40px hsl(var(--heritage-gold) / 0.8))'
					}
				},
				'text-shimmer': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'border-glow': {
					'0%, 100%': { 
						borderColor: 'hsl(var(--heritage-gold) / 0.3)'
					},
					'50%': { 
						borderColor: 'hsl(var(--heritage-gold) / 0.8)'
					}
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
					'50%': { transform: 'scale(1.1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-out': 'fade-out 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
				'fade-in-scale': 'fade-in-scale 0.5s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-up': 'slide-up 0.6s ease-out forwards',
				'slide-down': 'slide-down 0.5s ease-out forwards',
				'enter': 'fade-in 0.4s ease-out, scale-in 0.3s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'float-slow': 'float-slow 8s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'bounce-in': 'bounce-in 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'magnetic-pull': 'magnetic-pull 0.6s ease-in-out',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'text-shimmer': 'text-shimmer 4s ease-in-out infinite',
				'border-glow': 'border-glow 2s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 20s linear infinite',
				'breathe': 'breathe 4s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
