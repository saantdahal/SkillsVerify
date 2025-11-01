import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Search, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogin } from "@/context/UserContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getBalance } from "@/services/commonServices";
import CopyButton from "@/components/CopyButton";
import LogoImg from "../assets/logo.jpeg";

const Navbar = () => {
  // const { toggleChat } = useContext(ChatContext);
  const { isLoggedIn, userDetails, login, logOut } = useLogin();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const handleProfileClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDialogOpen(true);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (isLoggedIn && userDetails?.address) {
        try {
          const rawBalance = await getBalance(userDetails.address);
          const suiBalance = rawBalance / 10 ** 9;
          setBalance(suiBalance);
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(0);
        }
      }
    };

    fetchBalance();
  }, [isLoggedIn, userDetails]);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
              <img src={LogoImg} alt="logo" />
            </div>
            <span className="hidden text-xl font-semibold md:inline">
              TrustChain
            </span>
          </Link>
        </div>

        <div className="relative hidden md:block w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* {isLoggedIn && (
            <Link to="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-muted"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  2
                </span>
              </Button>
            </Link>
          )} */}
          {isLoggedIn ? (
            <>
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-9 w-9 border-2 border-border">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <Wallet />

                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none flex items-center gap-2">
                          {userDetails?.address ? (
                            <>
                              {userDetails.address.slice(0, 6)}...
                              {userDetails.address.slice(-4)}
                              <CopyButton
                                textToCopy={userDetails.address}
                                size={14}
                                tooltipText="Copy wallet address"
                              />
                            </>
                          ) : (
                            "Loading..."
                          )}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {balance.toFixed(3)} SUI
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  {/* <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleProfileClick}>
                    <div className="w-full flex items-center gap-2 cursor-pointer">
                      <User /> Profile
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem onClick={logOut}>
                    <LogOut />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}
              >
                <DialogContent className="sm:max-w-md">
                  {/* <CreateProfile /> */}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Button onClick={login} variant="default" className="rounded-full">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
