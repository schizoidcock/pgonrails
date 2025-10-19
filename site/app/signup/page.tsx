import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import SignupForm from "@/components/forms/SignupForm"
// import ProviderSigninBlock from "@/components/ProviderSigninBlock"

export default function Signup() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">

            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center py-4">
                        <Link prefetch={false} href='/'>
                            <Image src="/logo.png" alt="logo" width={50} height={50} />
                        </Link>
                    </div>

                    <CardTitle className="text-2x\l font-bold">Signup</CardTitle>
                    <CardDescription>Create your account now!</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SignupForm />
                    {/* <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <ProviderSigninBlock /> */}
                </CardContent>
                <CardFooter className="flex-col text-center">
                    <Link prefetch={false} className="w-full text-sm text-muted-foreground hover:underline" href="/signin">
                        Have an account? Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div >

    )
}