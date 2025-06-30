import React, { useState } from "react";
import {
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  encodeFunctionData,
  parseUnits,
} from "viem";
import {
  useReadContract,
  usePublicClient,
  useSendTransaction,
  useWatchContractEvent,
} from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import { CONTRACTS } from "../config/wagmi";
import { POOL_ABI, MOCK_USDC_ABI, MOCK_USDT_ABI } from "../contracts/abis";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const ERC20_DECIMALS = 18;
const PRECISION = 10000;

const AddLiquidity = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [usdcAmount, setUsdcAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [step, setStep] = useState("idle");
  const [lastEdited, setLastEdited] = useState(null); // "usdc" or "usdt"


  const { data: usdcAllowance } = useReadContract({
    address: CONTRACTS.MOCK_USDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: [address, CONTRACTS.POOL],
    watch: true,
  });

  const { data: usdtAllowance } = useReadContract({
    address: CONTRACTS.MOCK_USDT,
    abi: MOCK_USDT_ABI,
    functionName: "allowance",
    args: [address, CONTRACTS.POOL],
    watch: true,
  });

  const { data: usdcPoolAmount } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "get_USDC_Price",
    watch: true,
  });

  const { data: usdtPoolAmount } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "get_USDT_Price",
    watch: true,
  });

  const { data: usdcTotal } = useReadContract({
    address: CONTRACTS.MOCK_USDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [CONTRACTS.POOL],
    watch: true,
  });

  const { data: usdtTotal } = useReadContract({
    address: CONTRACTS.MOCK_USDT,
    abi: MOCK_USDT_ABI,
    functionName: "balanceOf",
    args: [CONTRACTS.POOL],
    watch: true,
  });

  const resetState = () => {
    setStep("idle");
  setUsdcAmount("");
  setUsdtAmount("");
  setLastEdited(null); // <- reset the editing flag too
  toast.dismiss();
  };

  const handleApproveAndAddLiquidity = async (e) => {
    e.preventDefault();
    if (!usdcAmount || !usdtAmount || step !== "idle") return;

    try {
      const usdc = parseUnits(usdcAmount, ERC20_DECIMALS);
      const usdt = parseUnits(usdtAmount, ERC20_DECIMALS);

      // Approve USDC if needed
      if (!usdcAllowance || BigInt(usdcAllowance) < usdc) {
        setStep("approvingUSDC");
        toast.loading("Approving USDC...", { id: "usdc-toast" });

        const data = encodeFunctionData({
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [CONTRACTS.POOL, usdc],
        });

        const hash = await sendTransactionAsync({
          to: CONTRACTS.MOCK_USDC,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        toast.dismiss("usdc-toast");
        toast.success("USDC approved!");
      }

      // Approve USDT if needed
      if (!usdtAllowance || BigInt(usdtAllowance) < usdt) {
        setStep("approvingUSDT");
        toast.loading("Approving USDT...", { id: "usdt-toast" });

        const data = encodeFunctionData({
          abi: MOCK_USDT_ABI,
          functionName: "approve",
          args: [CONTRACTS.POOL, usdt],
        });

        const hash = await sendTransactionAsync({
          to: CONTRACTS.MOCK_USDT,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        toast.dismiss("usdt-toast");
        toast.success("USDT approved!");
      }

      // Add liquidity
      setStep("addingLiquidity");
      toast.loading("Adding liquidity...", { id: "add-toast" });

      const data = encodeFunctionData({
        abi: POOL_ABI,
        functionName: "provideLiquidity",
        args: [usdc, usdt],
      });

      const hash = await sendTransactionAsync({
        to: CONTRACTS.POOL,
        data,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      toast.dismiss("add-toast");
      toast.success("Liquidity added successfully!");
      resetState();
    } catch (err) {
      console.error("Add liquidity error:", err);
      toast.dismiss();
      toast.error(err?.message || "Transaction failed");
      resetState();
    }
  };

  useWatchContractEvent({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    eventName: "LiquidityAdded",
    listener: (logs) => {
      logs.forEach((log) => {
        if (log.args?.provider === address) {
          toast.dismiss("add-toast");
          toast.success("Liquidity confirmed on-chain!", {
            position: "top-center",
          });
        }
      });
    },
  });

const handleUsdcChange = (value) => {
  if (!lastEdited) setLastEdited("usdc");
  setUsdcAmount(value);
  const parsed = parseFloat(value);
  if (!isNaN(parsed)) {
    setUsdtAmount((parsed / 2).toString());
  } else {
    setUsdtAmount("");
  }
};

const handleUsdtChange = (value) => {
  if (!lastEdited) setLastEdited("usdt");
  setUsdtAmount(value);
  const parsed = parseFloat(value);
  if (!isNaN(parsed)) {
    setUsdcAmount((parsed / 2).toString());
  } else {
    setUsdcAmount("");
  }
};





  return (
  <div className="max-w-2xl mx-auto p-4">
    <Toaster />
    <Card className="p-8 rounded-xl shadow-2xl bg-[#0a0f2c] text-white border border-[#23395d]">
      <h2 className="text-3xl font-bold mb-6 text-yellow-300 text-center">Add Liquidity</h2>

      {/* Pool Info */}
      <div className="mb-8 p-5 rounded-lg bg-[#13294b] border border-blue-600">
        <h3 className="text-lg font-semibold mb-3 text-blue-300">
          Current Pool Liquidity (Precision 10,000)
        </h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold text-blue-200">USDC Price</p>
            <p className="text-xl font-bold text-yellow-400">
              {usdcPoolAmount ? (Number(usdcPoolAmount) / PRECISION).toFixed(4) : "0.0000"}
            </p>
            <p className="text-sm text-blue-300 mt-1">
              Total in Pool: {usdcTotal ? (Number(usdcTotal) / 1e18).toFixed(4) : "0.0000"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-200">USDT Price</p>
            <p className="text-xl font-bold text-yellow-400">
              {usdtPoolAmount ? (Number(usdtPoolAmount) / PRECISION).toFixed(4) : "0.0000"}
            </p>
            <p className="text-sm text-blue-300 mt-1">
              Total in Pool: {usdtTotal ? (Number(usdtTotal) / 1e18).toFixed(4) : "0.0000"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleApproveAndAddLiquidity} className="space-y-6">
        <div>
          <Label htmlFor="usdc" className="text-yellow-300">USDC</Label>
          <Input
            id="usdc"
            type="number"
            value={usdcAmount}
            onChange={(e) => handleUsdcChange(e.target.value)}
            disabled={lastEdited === "usdt"}
            onFocus={() => {
              if (!lastEdited && usdcAmount === "" && usdtAmount === "") {
                setLastEdited("usdc");
              }
            }}
            placeholder="Enter USDC"
            step="any"
            min="0"
            className="mt-1 bg-[#1f2758] text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        <div>
          <Label htmlFor="usdt" className="text-yellow-300">USDT (2:1 ratio)</Label>
          <Input
            id="usdt"
            type="number"
            value={usdtAmount}
            onChange={(e) => handleUsdtChange(e.target.value)}
            disabled={lastEdited === "usdc"}
            onFocus={() => {
              if (!lastEdited && usdcAmount === "" && usdtAmount === "") {
                setLastEdited("usdt");
              }
            }}
            placeholder="Enter USDT"
            step="any"
            min="0"
            className="mt-1 bg-[#1f2758] text-white border border-yellow-400 focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        <p className="text-xs text-blue-300 mt-2 mb-4">
          Enter any amount in either field. The other will auto-update to keep a 2:1 ratio.
        </p>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:brightness-110"
          disabled={!isConnected || step !== "idle"}
        >
          {{
            approvingUSDC: "Approving USDC...",
            approvingUSDT: "Approving USDT...",
            addingLiquidity: "Adding Liquidity...",
            idle: "Add Liquidity",
          }[step]}
        </Button>
      </form>
    </Card>
  </div>
);

};

export default AddLiquidity;
