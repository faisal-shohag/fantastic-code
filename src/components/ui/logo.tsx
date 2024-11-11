import React from 'react';

interface LogoProps {
  color?: string;
  width?: string;
  height?: string;
}

const Logo: React.FC<LogoProps> = ({ color = "#000000", width = "100%", height = "100%" }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width={width}
    height={height}
    viewBox="450 230 200 300"
    xmlSpace="preserve"
  >
    <defs>
      <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF5733">
          <animate attributeName="stop-color" values="#FF5733; #33FF57; #5733FF; #FF5733" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#33FF57">
          <animate attributeName="stop-color" values="#33FF57; #5733FF; #FF5733; #33FF57" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <path
      fill="url(#animatedGradient)"
      opacity="1.000000"
      stroke="none"
      d="
        M562.118652,307.939758 
        C559.490356,320.399933 556.983643,332.451477 554.391724,344.484680 
        C552.845337,351.663757 549.670227,354.230225 542.170776,354.258728 
        C527.171936,354.315765 512.172668,354.252167 497.173553,354.270477 
        C490.285645,354.278900 489.613281,354.863098 488.212341,361.591278 
        C485.667572,373.812927 485.785583,373.961823 498.245789,373.963348 
        C539.243347,373.968323 580.240906,373.970551 621.238464,373.974365 
        C622.571716,373.974487 623.905151,373.967621 625.238159,373.986389 
        C628.654419,374.034424 632.058044,374.161255 633.460205,378.147095 
        C634.802490,381.962769 632.167786,384.030945 629.794800,386.142975 
        C597.067078,415.271362 564.326172,444.385040 531.592529,473.506836 
        C509.438507,493.216339 487.290283,512.932373 465.141083,532.647339 
        C464.269897,533.422791 463.457794,534.270508 462.545349,534.992554 
        C460.227814,536.826233 457.768066,538.231262 454.807648,536.398987 
        C451.804016,534.539978 451.421326,531.812988 452.112152,528.553589 
        C455.352478,513.265381 458.479523,497.953278 461.672119,482.654968 
        C465.645630,463.615051 469.620483,444.575348 473.644897,425.546204 
        C474.929993,419.469818 478.224274,416.714630 484.468719,416.680054 
        C499.467377,416.597015 514.466797,416.654022 529.465881,416.638672 
        C537.374878,416.630615 538.222961,415.957092 539.889465,408.353241 
        C540.280334,406.569946 540.583008,404.763702 540.842468,402.956024 
        C541.495728,398.403717 539.167664,396.436371 534.893982,396.368774 
        C530.562073,396.300232 526.228149,396.357758 521.895142,396.357880 
        C482.064209,396.358887 442.233276,396.365326 402.402344,396.338928 
        C400.755859,396.337830 398.960327,396.392792 397.490845,395.792999 
        C392.922760,393.928223 392.887878,389.045746 397.482727,384.937164 
        C413.257996,370.831329 429.094879,356.794342 444.914062,342.737610 
        C482.903839,308.980255 520.896118,275.225647 558.890747,241.473816 
        C561.008179,239.592834 563.167175,237.758804 565.287598,235.881165 
        C567.745361,233.704758 570.521973,232.671463 573.483276,234.519409 
        C576.269653,236.258209 576.348877,238.979218 575.707397,242.042236 
        C571.139038,263.855194 566.690796,285.693298 562.118652,307.939758 
        z"
    />
  </svg>
);

export default Logo;
