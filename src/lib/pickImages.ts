// Opens the phone's photo picker. Must be called directly from a tap (user gesture).
// Resolves with the chosen files, or [] if the picker was cancelled.
export function pickImages({ multiple }: { multiple: boolean }): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = multiple
    input.hidden = true
    const done = (files: File[]) => {
      input.remove()
      resolve(files)
    }
    input.addEventListener('change', () => done(Array.from(input.files ?? [])))
    input.addEventListener('cancel', () => done([]))
    // iOS Safari only opens pickers for inputs that are in the document.
    document.body.append(input)
    input.click()
  })
}
