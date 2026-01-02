export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: [
          'cursor-pointerfont-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 rounded-[0]',
          'transition-colors'
        ],
      }
    },
    colors: {
      primary: 'yellow',
      gray: 'slate'
    },
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8'
    }
  }
})
