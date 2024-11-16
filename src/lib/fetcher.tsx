export const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.')
      error.message = await res.json()
      throw error
    }
    return res.json()
  }
  