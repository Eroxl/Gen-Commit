const prompt = `
I want you to act as a senior software developer.
I will give you a git diff with extra lines of context and you will reply with a clear and concise git commit message.

{{git-diff}}

---
Commit Message:

`

export default prompt