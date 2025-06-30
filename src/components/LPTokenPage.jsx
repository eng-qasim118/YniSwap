import React, { useEffect, useState } from "react";
import {
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  usePublicClient,
  useSendTransaction,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { encodeFunctionData, formatUnits } from "viem";
import toast, { Toaster } from "react-hot-toast";
import { Card } from "./ui/card";
import { POOL_ABI } from "../contracts/abis";
import { CONTRACTS } from "../config/wagmi";
import { Button } from "./ui/button";

const LPTokenPage = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [step, setStep] = useState("idle");
  const [removedUSDC, setRemovedUSDC] = useState(null);
  const [removedUSDT, setRemovedUSDT] = useState(null);

  const { data: lpBalance } = useReadContract({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    functionName: "get_User_LP_Amount",
    args: [address],
    watch: true,
  });

  const handleRemoveLiquidity = async () => {
    try {
      setStep("removing");
      toast.loading("Removing liquidity...", { id: "remove-toast" });

      const data = encodeFunctionData({
        abi: POOL_ABI,
        functionName: "removeLiquidity",
        args: [],
      });

      const hash = await sendTransactionAsync({
        to: CONTRACTS.POOL,
        data,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast.dismiss("remove-toast");
      toast.success("Liquidity removed successfully!", { position: "top-center" });
      setStep("success");
    } catch (err) {
      console.error("Remove liquidity error:", err);
      toast.dismiss("remove-toast");
      toast.error(err?.message || "Transaction failed", { position: "top-center" });
      setStep("error");
    }
  };

  useWatchContractEvent({
    address: CONTRACTS.POOL,
    abi: POOL_ABI,
    eventName: "LiquidityRemoved",
    listener(logs) {
      const userLog = logs.find((log) => log.args?.provider === address);
      if (userLog?.args) {
        setRemovedUSDC(userLog.args.totalUSDC);
        setRemovedUSDT(userLog.args.totalUSDT);
      }
    },
    enabled: step === "success",
  });

  return (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Toaster />
    <Card className="w-full max-w-md p-8 bg-[#0a0f2c] text-white border border-[#23395d] shadow-2xl rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-yellow-300 text-center">Your LP Tokens</h2>

      <div className="mb-6 text-base text-blue-200 text-center">
        As a liquidity provider, you receive LP tokens representing your share of the pool.
      </div>

      <div className="flex flex-col items-center justify-center bg-[#13294b] border border-blue-600 rounded-lg p-6">
        <span className="text-lg text-blue-300 font-semibold mb-2">LP Token Balance</span>
        <span className="text-4xl font-mono text-yellow-400">
          {lpBalance ? parseFloat(formatUnits(lpBalance, 18)).toFixed(4) : "0.0000"}
        </span>

        <Button
          className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:brightness-110"
          onClick={handleRemoveLiquidity}
          disabled={!isConnected || !lpBalance || lpBalance === "0" || step === "removing"}
        >
          {step === "removing" ? "Removing..." : "Remove Liquidity"}
        </Button>

        {step === "success" && (
          <div className="mt-5 text-green-400 text-sm text-center bg-green-900/30 p-3 rounded-lg w-full">
            <p className="font-medium">Liquidity removed!</p>
            {removedUSDC && removedUSDT ? (
              <p className="mt-1 text-green-300">
                You withdrew{" "}
                <span className="font-semibold">
                  {parseFloat(formatUnits(removedUSDC, 18)).toFixed(4)} USDC
                </span>{" "}
                and{" "}
                <span className="font-semibold">
                  {parseFloat(formatUnits(removedUSDT, 18)).toFixed(4)} USDT
                </span>.
              </p>
            ) : (
              <p className="mt-1 text-green-300">
                You have withdrawn your invested amount plus any earned fees.
              </p>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="mt-5 text-red-400 text-sm text-center bg-red-900/30 p-3 rounded-lg w-full">
            Transaction failed. Please try again.
          </div>
        )}
      </div>
    </Card>
  </div>
);

};

export default LPTokenPage;
