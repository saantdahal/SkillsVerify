import { useLogin } from "@/context/UserContext";
import { Button } from "../ui/button";
import {
  Fingerprint,
  Shield,
  Lock,
  KeyRound,
  Sparkles,
  LogIn,
} from "lucide-react";

const LoggedOutView = () => {
  const { login } = useLogin();
  return (
    <div className=" h-screen bg-background flex items-center justify-center ">
      <div className="w-full max-w-[1200px] flex flex-col items-center relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-fuchsia-600/20 blur-3xl" />

        {/* Content container */}
        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Platform Info */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                  ChainFluence
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground font-light">
                  Where creator meets freedom
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid gap-6">
                <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border/50">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">
                      social presence
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Secure authentication without compromising data
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border/50">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">
                      End-to-End Privacy
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Your content, your control
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border/50">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">
                      Creator-First Platform
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Built for the next generation of creators
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login Card */}
            <div className="lg:ml-auto w-full max-w-md">
              <div className="bg-card/50 p-8 rounded-lg border border-border shadow-2xl">
                <div className="space-y-6">
                  {/* Logo */}
                  <div className="flex justify-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <KeyRound className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-muted-foreground text-center text-sm mb-8">
                    Sign in with google
                  </p>

                  {/* ZK Login Button */}
                  <Button
                    onClick={login}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-6 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <LogIn className="h-5 w-5" />

                    <span className="font-medium text-lg">
                      Connect with Google{" "}
                    </span>
                  </Button>

                  {/* Terms */}
                  <p className="text-center text-xs text-muted-foreground mt-8">
                    By continuing, you agree to our{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-primary/90 transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-primary/90 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedOutView;
