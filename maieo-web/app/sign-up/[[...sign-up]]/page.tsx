import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-[440px] flex justify-center">
        <SignUp appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-[#111111] border border-[#222] shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-[#1a1a1a] border-[#333] text-white hover:bg-[#222]",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-[#1a1a1a] border-[#333] text-white focus:border-[#7c6af7]",
          formButtonPrimary: "bg-[#7c6af7] hover:bg-[#6b5ce7] text-white transition-colors",
          footerActionLink: "text-[#7c6af7] hover:text-[#6b5ce7]",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-[#7c6af7]",
          dividerText: "text-gray-500",
          dividerLine: "bg-[#222]"
        }
        }} />
      </div>
    </div>
  )
}
