// create key string
export const getEmailIPkey = (email: string, ip: string) => `${email}_${ip}`;