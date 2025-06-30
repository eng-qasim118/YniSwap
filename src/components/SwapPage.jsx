
// import React, { useState } from "react";
// import {
//   useReadContract,
//   useSendTransaction,
//   usePublicClient,
// } from "wagmi";
// import { parseUnits, formatUnits, encodeFunctionData } from "viem";
// import { useAppKitAccount } from "@reown/appkit/react";
// import { Card } from "./ui/card";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { POOL_ABI, MOCK_USDC_ABI, MOCK_USDT_ABI } from "../contracts/abis";
// import { CONTRACTS } from "../config/wagmi";
// import toast, { Toaster } from "react-hot-toast";

// const tokens = [
//   { symbol: "USDC", address: CONTRACTS.MOCK_USDC, abi: MOCK_USDC_ABI, decimals: 18 },
//   { symbol: "USDT", address: CONTRACTS.MOCK_USDT, abi: MOCK_USDT_ABI, decimals: 18 },
// ];

// const SwapPage = () => {
//   const publicClient = usePublicClient();
//   const { address, isConnected } = useAppKitAccount();
//   const { sendTransactionAsync } = useSendTransaction();

//   const [fromToken, setFromToken] = useState(tokens[0]);
//   const toToken = fromToken.symbol === "USDC" ? tokens[1] : tokens[0];
//   const [amount, setAmount] = useState("");
//   const [step, setStep] = useState("idle");

//   const { data: fromBalance } = useReadContract({
//     address: fromToken.address,
//     abi: fromToken.abi,
//     functionName: "balanceOf",
//     args: [address],
//     watch: true,
//   });

//   const { data: allowance } = useReadContract({
//     address: fromToken.address,
//     abi: fromToken.abi,
//     functionName: "allowance",
//     args: [address, CONTRACTS.POOL],
//     watch: true,
//   });

//   const { data: usdcPoolReserve } = useReadContract({
//     address: CONTRACTS.POOL,
//     abi: POOL_ABI,
//     functionName: "getReserveUSDC",
//     watch: true,
//   });

//   const { data: usdtPoolReserve } = useReadContract({
//     address: CONTRACTS.POOL,
//     abi: POOL_ABI,
//     functionName: "getReserveUSDT",
//     watch: true,
//   });

//   const { data: usdcPrice } = useReadContract({
//     address: CONTRACTS.POOL,
//     abi: POOL_ABI,
//     functionName: "get_USDC_Price",
//     watch: true,
//   });

//   const { data: usdtPrice } = useReadContract({
//     address: CONTRACTS.POOL,
//     abi: POOL_ABI,
//     functionName: "get_USDT_Price",
//     watch: true,
//   });

//   const valueToSwap = amount ? parseUnits(amount, fromToken.decimals) : 0n;
//   const needsApproval = !allowance || BigInt(allowance) < valueToSwap;

//   const handleApproveAndSwap = async (e) => {
//     e.preventDefault();
//     if (!address || !valueToSwap) return;

//     try {
//       setStep("approving");
//       toast.loading("Waiting for approval...", { id: "approval" });

//       const approvalData = encodeFunctionData({
//         abi: fromToken.abi,
//         functionName: "approve",
//         args: [CONTRACTS.POOL, valueToSwap],
//       });

//       const approvalTx = await sendTransactionAsync({
//         to: fromToken.address,
//         data: approvalData,
//       });

//       await publicClient.waitForTransactionReceipt({ hash: approvalTx });
//       toast.success("Token approved", { id: "approval" });

//       handleSwap();
//     } catch (err) {
//       console.error("Approval failed:", err);
//       toast.error("Approval rejected or failed", { id: "approval" });
//       setStep("idle");
//     }
//   };

//   const handleSwap = async () => {
//     try {
//       setStep("swapping");
//       toast.loading("Swapping tokens...", { id: "swap" });

//       const functionName = fromToken.symbol === "USDC" ? "swapUSDC" : "swapUSDT";
//       const swapData = encodeFunctionData({
//         abi: POOL_ABI,
//         functionName,
//         args: [valueToSwap],
//       });

//       const swapTx = await sendTransactionAsync({
//         to: CONTRACTS.POOL,
//         data: swapData,
//       });

//       await publicClient.waitForTransactionReceipt({ hash: swapTx });
//       toast.success("Swap successful!", { id: "swap" });
//       setAmount("");
//     } catch (err) {
//       console.error("Swap failed:", err);
//       toast.error("Swap failed", { id: "swap" });
//     } finally {
//       setStep("idle");
//     }
//   };

//   const x = usdcPoolReserve ? parseFloat(formatUnits(usdcPoolReserve, 18)) : 0;
//   const y = usdtPoolReserve ? parseFloat(formatUnits(usdtPoolReserve, 18)) : 0;
//   const k = x * y;

//   const price =
//     fromToken.symbol === "USDC"
//       ? usdcPrice ? (Number(usdcPrice) / 10000).toFixed(4) : "-"
//       : usdtPrice ? (Number(usdtPrice) / 10000).toFixed(4) : "-";

//   const FEE_PRECISION = 10000;
//   const FEE_VALUE = 200;
//   const feePercent = (FEE_VALUE / FEE_PRECISION) * 100;

//   return (
//     <div className="flex justify-center items-center min-h-[60vh]">
//       <Toaster position="top-center" />
//       <Card className="w-full max-w-md p-8 shadow-xl">
//         <h2 className="text-2xl font-bold mb-6 text-center">Swap Tokens</h2>
//         <form
//           onSubmit={
//             needsApproval
//               ? handleApproveAndSwap
//               : (e) => {
//                   e.preventDefault();
//                   handleSwap();
//                 }
//           }
//           className="space-y-6"
//         >
//           <div className="flex justify-between items-center mb-2">
//             <Label htmlFor="from">From</Label>
//             <select
//               id="from"
//               value={fromToken.symbol}
//               onChange={(e) =>
//                 setFromToken(tokens.find((t) => t.symbol === e.target.value))
//               }
//               className="ml-2 rounded-md border-gray-300 shadow-sm"
//             >
//               {tokens.map((token) => (
//                 <option key={token.symbol} value={token.symbol}>
//                   {token.symbol}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-2 flex justify-between items-center bg-blue-50 rounded p-2">
//             <span className="text-sm text-gray-700 font-medium">Your {fromToken.symbol} Balance:</span>
//             <span className="text-base font-mono text-blue-700">
//               {fromBalance ? parseFloat(formatUnits(fromBalance, fromToken.decimals)).toFixed(4) : "0.0000"}
//             </span>
//           </div>

//           <div>
//             <Label htmlFor="amount">Amount</Label>
//             <Input
//               id="amount"
//               type="number"
//               min="0"
//               step="any"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder={`Enter ${fromToken.symbol} amount`}
//             />
//           </div>

//           <div className="mb-2 flex justify-between items-center bg-gray-50 rounded p-2">
//             <span className="text-sm text-gray-700 font-medium">1 {fromToken.symbol} ≈</span>
//             <span className="text-base font-mono text-gray-700">{price} {toToken.symbol}</span>
//           </div>

//           <div className="mb-2 flex justify-between items-center bg-yellow-50 rounded p-2">
//             <span className="text-sm text-gray-700 font-medium">Pool Fee</span>
//             <span className="text-base font-mono text-yellow-700">{feePercent}%</span>
//           </div>

//           <Button
//             type="submit"
//             className="w-full"
//             disabled={!isConnected || !amount || step !== "idle"}
//           >
//             {needsApproval
//               ? step === "approving"
//                 ? `Approving ${fromToken.symbol}...`
//                 : `Approve & Swap ${fromToken.symbol}`
//               : step === "swapping"
//               ? "Swapping..."
//               : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
//           </Button>
//         </form>

//         <div className="mt-8 p-4 rounded-lg bg-[#001d3d] border border-[#4d194d] text-center">
//           <div className="mb-2 font-semibold text-gray-700">Pool State: x × y = k</div>
//           <div className="flex justify-between text-sm font-mono">
//             <span>x (USDC): <span style={{ color: "#ffc300" }}>{x.toFixed(4)}</span></span>
//             <span>y (USDT): <span style={{ color: "#ffc300" }}>{y.toFixed(4)}</span></span>
//             <span>k: <span style={{ color: "#ffc300" }}>{k.toFixed(4)}</span></span>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default SwapPage;



import React, { useState } from "react";
import {
  useReadContract,
  useSendTransaction,
  usePublicClient,
} from "wagmi";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { POOL_ABI, MOCK_USDC_ABI, MOCK_USDT_ABI } from "../contracts/abis";
import { CONTRACTS } from "../config/wagmi";
import toast, { Toaster } from "react-hot-toast";
import './SwapPage.css';
const tokens = [
  { symbol: "USDC", address: CONTRACTS.MOCK_USDC, abi: MOCK_USDC_ABI, decimals: 18 },
  { symbol: "USDT", address: CONTRACTS.MOCK_USDT, abi: MOCK_USDT_ABI, decimals: 18 },
];

const SwapPage = () => {
  const publicClient = usePublicClient();
  const { address, isConnected } = useAppKitAccount();
  const { sendTransactionAsync } = useSendTransaction();

  const [fromToken, setFromToken] = useState(tokens[0]);
  const toToken = fromToken.symbol === "USDC" ? tokens[1] : tokens[0];
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("idle");

  const { data: fromBalance } = useReadContract({
    address: fromToken.address,
    abi: fromToken.abi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: allowance } = useReadContract({
    address: fromToken.address,
    abi: fromToken.abi,
    functionName: "allowance",
    args: [address, CONTRACTS.POOL],
    watch: true,
  });

  const { data: usdcPoolReserve } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "getReserveUSDC",
    watch: true,
  });

  const { data: usdtPoolReserve } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "getReserveUSDT",
    watch: true,
  });

  const { data: usdcPrice } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "get_USDC_Price",
    watch: true,
  });

  const { data: usdtPrice } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "get_USDT_Price",
    watch: true,
  });

  const valueToSwap = amount ? parseUnits(amount, fromToken.decimals) : 0n;
  const needsApproval = !allowance || BigInt(allowance) < valueToSwap;

  const handleApproveAndSwap = async (e) => {
    e.preventDefault();
    if (!address || !valueToSwap) return;

    try {
      setStep("approving");
      toast.loading("Waiting for approval...", { id: "approval" });

      const approvalData = encodeFunctionData({
        abi: fromToken.abi,
        functionName: "approve",
        args: [CONTRACTS.POOL, valueToSwap],
      });

      const approvalTx = await sendTransactionAsync({
        to: fromToken.address,
        data: approvalData,
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalTx });
      toast.success("Token approved", { id: "approval" });

      handleSwap();
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Approval rejected or failed", { id: "approval" });
      setStep("idle");
    }
  };

  const handleSwap = async () => {
    try {
      setStep("swapping");
      toast.loading("Swapping tokens...", { id: "swap" });

      const functionName = fromToken.symbol === "USDC" ? "swapUSDC" : "swapUSDT";
      const swapData = encodeFunctionData({
        abi: POOL_ABI,
        functionName,
        args: [valueToSwap],
      });

      const swapTx = await sendTransactionAsync({
        to: CONTRACTS.POOL,
        data: swapData,
      });

      await publicClient.waitForTransactionReceipt({ hash: swapTx });
      toast.success("Swap successful!", { id: "swap" });
      setAmount("");
    } catch (err) {
      console.error("Swap failed:", err);
      toast.error("Swap failed", { id: "swap" });
    } finally {
      setStep("idle");
    }
  };

  const x = usdcPoolReserve ? parseFloat(formatUnits(usdcPoolReserve, 18)) : 0;
  const y = usdtPoolReserve ? parseFloat(formatUnits(usdtPoolReserve, 18)) : 0;
  const k = x * y;

  const price =
    fromToken.symbol === "USDC"
      ? usdcPrice ? (Number(usdcPrice) / 10000).toFixed(4) : "-"
      : usdtPrice ? (Number(usdtPrice) / 10000).toFixed(4) : "-";

  const FEE_PRECISION = 10000;
  const FEE_VALUE = 200;
  const feePercent = (FEE_VALUE / FEE_PRECISION) * 100;

  // Calculate expected output based on constant product formula with fee
  const FEE_NUMERATOR = 10000 - FEE_VALUE;
  const amountIn = parseFloat(amount);
  let expectedOutput = "";

  if (amountIn > 0 && x > 0 && y > 0) {
    const reserveIn = fromToken.symbol === "USDC" ? x : y;
    const reserveOut = fromToken.symbol === "USDC" ? y : x;

    const amountInWithFee = amountIn * FEE_NUMERATOR;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * FEE_PRECISION + amountInWithFee;

    const output = numerator / denominator;
    expectedOutput = output.toFixed(4);
  }

  return (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Toaster position="top-center" />
    <Card className="w-full max-w-md p-8 shadow-2xl bg-[#0a0f2c] border border-[#3f3f74] text-white">
      <h2 className="text-3xl font-bold mb-6 text-center text-yellow-300">Swap Tokens</h2>
      <form
        onSubmit={
          needsApproval
            ? handleApproveAndSwap
            : (e) => {
                e.preventDefault();
                handleSwap();
              }
        }
        className="space-y-6"
      >
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="from" className="text-xl text-yellow-200">From</Label>
<select
  id="from"
  value={fromToken.symbol}
  onChange={(e) =>
    setFromToken(tokens.find((t) => t.symbol === e.target.value))
  }
  className="
    text-white
    bg-[#1f2758]
    border border-yellow-500
    rounded-md
    px-3 py-2
    appearance-none
    focus:outline-none focus:ring-2 focus:ring-yellow-400
  "
>
  {tokens.map((token) => (
    <option
      key={token.symbol}
      value={token.symbol}
      className="bg-[#1f2758] text-white"
    >
      {token.symbol}
    </option>
  ))}
</select>

        </div>

        <div className="mb-2 flex justify-between items-center bg-blue-900/60 rounded p-2 border border-blue-400">
          <span className="text-sm text-blue-200 font-medium">Your {fromToken.symbol} Balance:</span>
          <span className="text-base font-mono text-blue-300">
            {fromBalance ? parseFloat(formatUnits(fromBalance, fromToken.decimals)).toFixed(4) : "0.0000"}
          </span>
        </div>

        <div>
          <Label htmlFor="amount" className="text-yellow-200">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${fromToken.symbol} amount`}
            className="bg-[#1f2758] text-white border border-yellow-500 placeholder:text-yellow-100 focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {expectedOutput && (
          <div className="mb-2 flex justify-between items-center bg-green-900/60 rounded p-2 border border-green-400">
            <span className="text-sm text-green-200 font-medium">You will receive approx:</span>
            <span className="text-base font-mono text-green-300">{expectedOutput} {toToken.symbol}</span>
          </div>
        )}

        <div className="mb-2 flex justify-between items-center bg-gray-800 rounded p-2 border border-gray-500">
          <span className="text-sm text-gray-300 font-medium">1 {fromToken.symbol} ≈</span>
          <span className="text-base font-mono text-gray-100">{price} {toToken.symbol}</span>
        </div>

        <div className="mb-2 flex justify-between items-center bg-yellow-900/60 rounded p-2 border border-yellow-500">
          <span className="text-sm text-yellow-200 font-medium">Pool Fee</span>
          <span className="text-base font-mono text-yellow-300">{feePercent}%</span>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-black hover:brightness-110 transition"
          disabled={!isConnected || !amount || step !== "idle"}
        >
          {needsApproval
            ? step === "approving"
              ? `Approving ${fromToken.symbol}...`
              : `Approve & Swap ${fromToken.symbol}`
            : step === "swapping"
            ? "Swapping..."
            : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
        </Button>
      </form>

      <div className="mt-8 p-4 rounded-lg bg-[#001d3d] border border-purple-600 text-center shadow-inner">
        <div className="mb-2 text-lg font-semibold text-purple-300">Pool State: x × y = k</div>
        <div className="flex justify-between text-base font-mono text-yellow-300">
          <span>x (USDC): <span className="text-yellow-400">{x.toFixed(4)}</span></span>
          <span>y (USDT): <span className="text-yellow-400">{y.toFixed(4)}</span></span>
          <span>k: <span className="text-yellow-400">{k.toFixed(4)}</span></span>
        </div>
      </div>
    </Card>
  </div>
);

};

export default SwapPage;
