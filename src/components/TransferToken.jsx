import React, { useState } from "react";
import {
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  encodeFunctionData,
  parseUnits,
  formatUnits,
} from "viem";
import {
  usePublicClient,
  useSendTransaction,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import { MOCK_USDC_ABI, MOCK_USDT_ABI } from "../contracts/abis";
import { CONTRACTS } from "../config/wagmi";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const tokens = [
  { symbol: "USDC", address: CONTRACTS.MOCK_USDC, abi: MOCK_USDC_ABI, decimals: 18 },
  { symbol: "USDT", address: CONTRACTS.MOCK_USDT, abi: MOCK_USDT_ABI, decimals: 18 },
];

const TransferToken = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [token, setToken] = useState(tokens[0]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("idle");

  const { data: balance } = useReadContract({
    address: token.address,
    abi: token.abi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const reset = () => {
    setStep("idle");
    setRecipient("");
    setAmount("");
    toast.dismiss();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient || !amount || step !== "idle") return;

    try {
      const value = parseUnits(amount, token.decimals);

      setStep("transferring");
      toast.loading("Sending token...", { id: "transfer-toast" });

      const data = encodeFunctionData({
        abi: token.abi,
        functionName: "transfer",
        args: [recipient, value],
      });

      const hash = await sendTransactionAsync({
        to: token.address,
        data,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast.dismiss("transfer-toast");
      toast.success("Transfer successful!", { position: "top-center" });
      reset();
    } catch (err) {
      console.error("Transfer failed:", err);
      toast.dismiss("transfer-toast");
      toast.error(err?.message || "Transfer failed", { position: "top-center" });
      setStep("idle");
    }
  };

 return (
  <div className="max-w-md mx-auto p-4">
    <Toaster />
    <Card className="p-8 bg-[#0a0f2c] text-white rounded-xl border border-[#23395d] shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-yellow-300 text-center">
        Transfer Token
      </h2>

      {/* User Balance */}
      <div className="mb-6 p-4 rounded-lg bg-[#13294b] border border-blue-600 flex items-center justify-between">
        <span className="text-base font-medium text-blue-200">
          Your {token.symbol} Balance:
        </span>
        <span className="text-lg font-mono text-yellow-400">
          {balance ? parseFloat(formatUnits(balance, token.decimals)).toFixed(4) : "0.0000"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Dropdown */}
        <div>
          <Label htmlFor="token" className="text-yellow-200 text-sm">Select Token</Label>
          <select
            id="token"
            value={token.symbol}
            onChange={(e) =>
              setToken(tokens.find((t) => t.symbol === e.target.value))
            }
            className="
              mt-1 block w-full rounded-md bg-[#1f2758] text-white
              border border-yellow-500 px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-yellow-400
              appearance-none
            "
          >
            {tokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Address */}
        <div>
          <Label htmlFor="recipient" className="text-yellow-200 text-sm">Recipient Address</Label>
          <Input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="mt-1 bg-[#1f2758] text-white border border-yellow-500 placeholder:text-yellow-100 focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="amount" className="text-yellow-200 text-sm">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="mt-1 bg-[#1f2758] text-white border border-yellow-500 placeholder:text-yellow-100 focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:brightness-110"
          disabled={!isConnected || step !== "idle" || !recipient || !amount}
        >
          {step === "transferring" ? "Transferring..." : "Transfer"}
        </Button>
      </form>
    </Card>
  </div>
);

};

export default TransferToken;
