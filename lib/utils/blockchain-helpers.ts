import { ethers } from "ethers"

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
}

export function formatWei(wei: string | bigint, decimals = 18): string {
  try {
    return ethers.formatUnits(wei, decimals)
  } catch (error) {
    console.error("[v0] Error formatting wei:", error)
    return "0"
  }
}

export function parseToWei(value: string, decimals = 18): bigint {
  try {
    return ethers.parseUnits(value, decimals)
  } catch (error) {
    console.error("[v0] Error parsing to wei:", error)
    return 0n
  }
}

export function getExplorerUrl(hash: string, network = "sepolia"): string {
  const baseUrls: Record<string, string> = {
    mainnet: "https://etherscan.io/tx/",
    sepolia: "https://sepolia.etherscan.io/tx/",
    polygon: "https://polygonscan.com/tx/",
    mumbai: "https://mumbai.polygonscan.com/tx/",
  }
  return `${baseUrls[network] || baseUrls.sepolia}${hash}`
}

export async function waitForTransaction(
  provider: ethers.BrowserProvider,
  txHash: string,
  confirmations = 1,
): Promise<ethers.TransactionReceipt | null> {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations)
    return receipt
  } catch (error) {
    console.error("[v0] Error waiting for transaction:", error)
    return null
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("user rejected")) {
      return "Transaction was rejected by user"
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transaction"
    }
    return error.message
  }
  return "An unknown error occurred"
}
