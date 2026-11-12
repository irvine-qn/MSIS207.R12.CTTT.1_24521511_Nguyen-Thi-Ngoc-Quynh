export class AudioTaskQueue {
  #tasks = []

  enqueue(task) {
    this.#tasks = [...this.#tasks, task]
  }

  drain() {
    const tasks = this.#tasks
    this.#tasks = []
    return tasks
  }

  clear() {
    this.#tasks = []
  }

  get size() {
    return this.#tasks.length
  }
}
