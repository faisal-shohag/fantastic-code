export const PColor = {
    "Accepted": '#22C55E',
    "Wrong Answer": '#EF4444',
    "Time Limit Exceeded": '#F59E0B',
    "Memory Limit Exceeded": '#F59E0B',
    "Runtime Error": '#EF4444',
    "Compilation Error": '#EF4444',
    "Other": '#EF4444'
}

export const dateFormatter = (date) => {
   const d =  (new Date(date).toUTCString()).split(' ')
   d.pop()
   d.pop()
   return d.join(' ')
}