export { default } from "next-auth/middleware"

export const config = { matcher: ["/transactions/:path*", "/drivers/:path*", "/cards/:path*", "/payments/:path*", "/payment-method/:path*", "/statements/:path*", "/referral/:path*", "/settings/:path*"] }
