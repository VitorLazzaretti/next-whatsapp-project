const defaultThemes = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'leaves-background': "url('/leaves_background.png')",
        'chat-bg': "url('/chat_background.png')",
        'chat-bg2': "url('/bg2.jpg')",
        'chat-bg3': "url('/bg3.jpeg')",
        'chat-bg4': "url('/bg4.jpeg')",
        'connectme-logo': "url('/ConnectMe-Logo.png')",
        ...defaultThemes.backgroundImage
      },
    },
    colors: {
      ...colors,
      'yellow': {
        ...colors.yellow,
        '500': '#DDB004',
      }
    }
  },
  plugins: [],
}
