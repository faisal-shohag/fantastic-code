/* eslint-disable react/jsx-no-comment-textnodes */
import { Button } from "@/components/ui/button";
import { Code, PenTool, Zap } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 sm:pt-12 lg:pt-20 hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-js-purple dark:text-white mb-4 dark:bg-zinc-600">
                <span className="mr-2">✨ New!</span> Interactive JavaScript Challenges
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-gray-300 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Master JavaScript.</span>
                <span className="block code-gradient">Sharpen your JS Skills!</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Embark on Your JavaScript Adventure! Kickstart your journey as a beginner by tackling essential problems and transforming yourself into a confident JS developer, primed for success. Master the fundamentals of JavaScript—your key to unlocking any framework—before diving into advanced challenges that sharpen your skills. Follow our expertly crafted roadmap and ignite your learning journey today!
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                  {/* <Button size="lg" className="">
                    Start Learning
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button> */}
                 <Link href={"/problems"}>
                  <Button size="lg" variant="outline">
                    Try a Challenge
                  </Button>
                  </Link>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-js-purple/10 mb-2">
                      <Code className="h-6 w-6 text-js-purple" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Interactive Challenges</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-js-blue/10 mb-2">
                      <PenTool className="h-6 w-6 text-js-blue" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Structured Roadmap</p>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-js-orange/10 mb-2">
                      <Zap className="h-6 w-6 text-js-orange" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">MERN Readiness</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full lg:max-w-md animate-float">
              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-800 px-4 py-2 flex items-center">
                  <div className="flex space-x-1 mr-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-400">main.js</span>
                </div>
                <div className="p-6 bg-gray-900 font-mono text-sm text-gray-200 overflow-hidden">
                  <div className="mb-2">
                    <span className="text-purple-400">function</span> <span className="text-yellow-300">checkPalindrome</span>(<span className="text-orange-300">str</span>) {'{'}
                  </div>
                  <div className="pl-4 mb-2">
                    <span className="text-purple-400">let</span> <span className="text-blue-300">cleaned</span> = <span className="text-orange-300">str</span>.<span className="text-yellow-300">toLowerCase</span>().<span className="text-yellow-300">replace</span>(<span className="text-green-400">/[^a-z0-9]/g</span>, <span className="text-green-400">&apos; &apos;</span>);
                  </div>
                  <div className="pl-4 mb-2">
                    <span className="text-purple-400">let</span> <span className="text-blue-300">reversed</span> = <span className="text-blue-300">cleaned</span>.<span className="text-yellow-300">split</span>(<span className="text-green-400">&apos; &apos;</span>).<span className="text-yellow-300">reverse</span>().<span className="text-yellow-300">join</span>(<span className="text-green-400">&apos; &apos;</span>);
                  </div>
                  <div className="pl-4 mb-2">
                    <span className="text-purple-400">return</span> <span className="text-blue-300">cleaned</span> === <span className="text-blue-300">reversed</span>;
                  </div>
                  <div>{'}'}</div>
                  <div className="mt-3">
                    <span className="text-gray-400">// Test your solution</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-yellow-300">console.log</span>(<span className="text-yellow-300">checkPalindrome</span>(<span className="text-green-400">&quot;A man, a plan, a canal: Panama&quot;</span>));
                  </div>
                  <div className="mt-1 text-green-400">
                    // → true
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
