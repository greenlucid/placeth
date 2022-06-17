module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      gridTemplateRows: {
        16: "repeat(16, minmax(0, 1fr))",
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
}
