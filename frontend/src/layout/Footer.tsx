import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="font-bold text-xl text-white">EduChain</span>
            </div>
            <p className="text-slate-400 dark:text-slate-400">
              A decentralized learning platform where knowledge is shared,
              verified, and rewarded through blockchain technology.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 dark:text-slate-400  cursor-pointer hover:text-purple-600 dark:hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 dark:text-slate-400 cursor-pointer hover:text-purple-600 dark:hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 dark:text-slate-400 cursor-pointer hover:text-purple-600 dark:hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 dark:text-slate-400 cursor-pointer hover:text-purple-600 dark:hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/pages/explore"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/categories"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/pages/contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/pages/help"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/creators"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  For Creators
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/students"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/docs"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/terms"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-medium text-white mb-4">Stay Updated</h3>
            <p className="text-slate-400 dark:text-slate-400 mb-4">
              Subscribe to our newsletter for the latest updates and courses.
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-slate-800 border-slate-700 text-white rounded-r-none focus-visible:ring-slate-600"
              />
              <Button className="rounded-l-none">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} DeLearn. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/pages/terms"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/pages/privacy"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/pages/cookies"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
