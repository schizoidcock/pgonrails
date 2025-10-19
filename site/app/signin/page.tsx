import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import Link from 'next/link'
import Image from 'next/image'

// import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import SigninForm from "@/components/forms/SigninForm"

export default function Login() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center py-4">
                        <Link prefetch={false} href='/'>
                            <Image src="/logo.png" alt="logo" width={50} height={50} />
                        </Link>
                    </div>

                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Choose your preferred login method</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SigninForm />
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
                    <Link prefetch={false} className="w-full text-sm text-muted-foreground hover:underline" href="/forgot-password">
                        Forgot password?
                    </Link>
                    <Link prefetch={false} className="w-full text-sm text-muted-foreground hover:underline" href="/signup">
                        Don&apos;t have an account? Signup
                    </Link>
                </CardFooter>
            </Card>
        </div >

    )
}