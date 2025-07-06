"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Beams from "@/components/ui/beams";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Aptos,
  AptosConfig,
  Network as AptosNetwork,
} from "@aptos-labs/ts-sdk";
import { toast } from "@/hooks/use-toast";
import { WalletSelector } from "@/components/WalletSelector";
import { AlertCircle } from "lucide-react";

// Contract information from environment variables
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "";
const MODULE_NAME = process.env.NEXT_PUBLIC_MODULE_NAME || "";

export default function OnboardingPage() {
  const { account, connected, network, wallet, signAndSubmitTransaction } =
    useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [aptosClient, setAptosClient] = useState<Aptos | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    governanceToken: "",
    minimumProposalThreshold: "100",
    votingPeriod: "7",
    executionDelay: "2",
    initialGovernors: "",
    proposalCreationFee: "10",
    taskCreationFee: "5",
    minimumVotingPower: "1",
    delegationEnabled: true,
    aiDelegatesEnabled: false,
    publicMembership: true,
    requireVerification: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "DAO Details", description: "Basic information about your DAO" },
    {
      title: "Governance Settings",
      description: "Configure voting and governance parameters",
    },
    {
      title: "Advanced Settings",
      description: "Configure advanced DAO features",
    },
    { title: "Finalization", description: "Review and create your DAO" },
  ];

  // Initialize Aptos client for devnet
  useEffect(() => {
    const config = new AptosConfig({
      network: AptosNetwork.DEVNET,
    });
    setAptosClient(new Aptos(config));
  }, []);

  // Create a DAO
  const createDAO = async () => {
    if (!aptosClient || !account) return;

    try {
      setIsLoading(true);

      // Pass empty array for governors
      const governors: string[] = [];

      const transaction: any = {
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::create_dao`,
          functionArguments: [
            formData.name,
            formData.description,
            formData.governanceToken,
            parseInt(formData.minimumProposalThreshold),
            parseInt(formData.votingPeriod) * 24 * 60 * 60, // Convert days to seconds
            parseInt(formData.executionDelay) * 24 * 60 * 60, // Convert days to seconds
            governors,
            parseInt(formData.proposalCreationFee),
            parseInt(formData.taskCreationFee),
            parseInt(formData.minimumVotingPower),
            formData.delegationEnabled,
            formData.aiDelegatesEnabled,
            formData.publicMembership,
            formData.requireVerification,
          ],
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      await aptosClient.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: "DAO Created Successfully",
        description:
          "Your DAO has been created successfully on the Aptos network.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        governanceToken: "",
        minimumProposalThreshold: "100",
        votingPeriod: "7",
        executionDelay: "2",
        initialGovernors: "",
        proposalCreationFee: "10",
        taskCreationFee: "5",
        minimumVotingPower: "1",
        delegationEnabled: true,
        aiDelegatesEnabled: false,
        publicMembership: true,
        requireVerification: false,
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Error creating DAO:", error);
      toast({
        title: "DAO Creation Failed",
        description:
          error instanceof Error ? error.message : "Failed to create DAO.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create DAO on final step
      createDAO();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.name.trim() !== "" && formData.description.trim() !== ""
        );
      case 1:
        return (
          formData.governanceToken.trim() !== "" &&
          formData.minimumProposalThreshold.trim() !== ""
        );
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-white font-medium">DAO Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Enter DAO name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 resize-none"
                placeholder="Describe your DAO's purpose and vision"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Governance Token</label>
              <input
                type="text"
                name="governanceToken"
                value={formData.governanceToken}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Enter governance token symbol (e.g., GOV)"
                required
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-white font-medium">
                Minimum Proposal Threshold
              </label>
              <input
                type="number"
                name="minimumProposalThreshold"
                value={formData.minimumProposalThreshold}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Minimum tokens required to create proposals"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">
                Voting Period (days)
              </label>
              <input
                type="number"
                name="votingPeriod"
                value={formData.votingPeriod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="How long voting stays open"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">
                Execution Delay (days)
              </label>
              <input
                type="number"
                name="executionDelay"
                value={formData.executionDelay}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Delay before executing passed proposals"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-white font-medium">
                Proposal Creation Fee
              </label>
              <input
                type="number"
                name="proposalCreationFee"
                value={formData.proposalCreationFee}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Fee required to create proposals"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">
                Task Creation Fee
              </label>
              <input
                type="number"
                name="taskCreationFee"
                value={formData.taskCreationFee}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Fee required to create tasks"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">
                Minimum Voting Power
              </label>
              <input
                type="number"
                name="minimumVotingPower"
                value={formData.minimumVotingPower}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200"
                placeholder="Minimum voting power required"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="delegationEnabled"
                  checked={formData.delegationEnabled}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 focus:ring-2"
                />
                <label className="text-white font-medium">
                  Enable Delegation
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="aiDelegatesEnabled"
                  checked={formData.aiDelegatesEnabled}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 focus:ring-2"
                />
                <label className="text-white font-medium">
                  Enable AI Delegates
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="publicMembership"
                  checked={formData.publicMembership}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 focus:ring-2"
                />
                <label className="text-white font-medium">
                  Public Membership
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="requireVerification"
                  checked={formData.requireVerification}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 bg-white/10 border-white/20 rounded focus:ring-red-500 focus:ring-2"
                />
                <label className="text-white font-medium">
                  Require Verification
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Review Your DAO
              </h3>
              <p className="text-white/70">
                Please review the information before creating your DAO
              </p>
            </div>

            <div className="grid gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">DAO Name</span>
                    <span className="text-white font-medium">
                      {formData.name}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-white/70">Description</span>
                    <span className="text-white font-medium text-right max-w-xs">
                      {formData.description}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Governance Token</span>
                    <span className="text-white font-medium">
                      {formData.governanceToken}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Voting Period</span>
                    <span className="text-white font-medium">
                      {formData.votingPeriod} days
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">
                      Min. Proposal Threshold
                    </span>
                    <span className="text-white font-medium">
                      {formData.minimumProposalThreshold}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Public Membership</span>
                    <span className="text-white font-medium">
                      {formData.publicMembership ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Beams */}
      <div className="fixed inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={32}
          beamNumber={20}
          lightColor="#ff0000"
          speed={5}
          noiseIntensity={2}
          scale={0.2}
          rotation={135}
          beamSpacing={0}
        />
      </div>

      {/* Navbar */}

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Create DAO
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Establish your decentralized autonomous organization in the
                ArcheDAO ecosystem. Configure governance rules, voting
                parameters, and community settings.
              </p>
              {!connected && (
                <div className="flex justify-center mb-8">
                  <WalletSelector />
                </div>
              )}
            </div>

            {/* Show form only if connected */}
            {!connected && (
              <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="flex flex-col items-center justify-center p-12 gap-4">
                  <AlertCircle className="h-12 w-12 text-amber-500" />
                  <h2 className="text-xl font-medium text-white">
                    Connect Your Wallet
                  </h2>
                  <p className="text-center text-white/70">
                    Please connect your wallet to create a DAO
                  </p>
                  <WalletSelector />
                </CardContent>
              </Card>
            )}

            {connected && (
              <>
                {/* Progress Steps */}
                <div className="flex justify-center mb-12">
                  <div className="flex items-center space-x-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                            index <= currentStep
                              ? "bg-red-600 border-red-600 text-white"
                              : "border-white/20 text-white/50"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`w-16 h-0.5 mx-2 transition-all duration-200 ${
                              index < currentStep ? "bg-red-600" : "bg-white/20"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Card */}
                <Card className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">
                      {steps[currentStep].title}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {steps[currentStep].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {renderStepContent()}

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setCurrentStep(Math.max(0, currentStep - 1))
                          }
                          disabled={currentStep === 0}
                          className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                        >
                          Previous
                        </Button>

                        <Button
                          type="submit"
                          disabled={!isStepValid() || isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        >
                          {isLoading
                            ? "Processing..."
                            : currentStep === steps.length - 1
                            ? "Create DAO"
                            : "Next"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff0000;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}




look at how aptos contract is being integrated in the above code.

now i want you to integrate this move contract
module voice_nft::voice_nft {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use std::bcs;
    use aptos_framework::object;
    use aptos_framework::table::{Self, Table};
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    /// Error codes
    const E_INVALID_METADATA: u64 = 1;
    const E_ALREADY_VOTED: u64 = 2;
    const E_TOKEN_NOT_FOUND: u64 = 3;
    const E_MODULE_NOT_INITIALIZED: u64 = 4;
    const E_USER_COLLECTION_MISSING: u64 = 5;

    /// NFT structure
    struct VoiceNFT has key, store, copy, drop {
        id: u64,
        metadata: String,
    }

    /// Vote counts
    struct VoteCounts has store, copy, drop {
        for_votes: u64,
        against_votes: u64,
    }

    /// User vote key structure
    struct UserVoteKey has store, copy, drop {
        user: address,
        token_id: u64,
    }

    /// Global state
    struct VoiceNFTData has key {
        next_token_id: u64,
        tokens: Table<u64, address>, // token_id -> token address
    }

    /// Voting state
    struct VotingData has key {
        vote_counts: Table<u64, VoteCounts>, // token_id -> vote counts
        user_votes: Table<UserVoteKey, bool>, // user vote key -> voted
    }

    /// Collection constants
    const COLLECTION_NAME: vector<u8> = b"Voice NFT Collection";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Voice-based NFTs with voting";
    const COLLECTION_URI: vector<u8> = b"https://voice-nft.com";

    /// Initialize contract
    fun init_module(account: &signer) {
        move_to(account, VoiceNFTData {
            next_token_id: 1,
            tokens: table::new(),
        });

        move_to(account, VotingData {
            vote_counts: table::new(),
            user_votes: table::new(),
        });
    }

    /// Mint NFT with metadata
    public entry fun mint_voice_nft(
        user: &signer,
        metadata: String,
    ) acquires VoiceNFTData, VotingData {
        let user_address = signer::address_of(user);
        let contract_address = @voice_nft;

        // Validate metadata
        assert!(!string::is_empty(&metadata), E_INVALID_METADATA);

        // Verify module initialized
        assert!(exists<VoiceNFTData>(contract_address), E_MODULE_NOT_INITIALIZED);

        // Get next token ID
        let data = borrow_global_mut<VoiceNFTData>(contract_address);
        let token_id = data.next_token_id;

        // Create unique collection name using user address and token ID
        let collection_name = string::utf8(COLLECTION_NAME);
        string::append(&mut collection_name, string::utf8(b" "));
        string::append(&mut collection_name, address_to_string(user_address));
        string::append(&mut collection_name, string::utf8(b" "));
        string::append(&mut collection_name, u64_to_string(token_id));

        // Create token name
        let token_name = string::utf8(b"Voice NFT #");
        string::append(&mut token_name, u64_to_string(token_id));
        
        // Create collection for this token
        let _collection_constructor_ref = collection::create_unlimited_collection(
            user,
            string::utf8(COLLECTION_DESCRIPTION),
            collection_name,
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        // Create token
        let token_constructor_ref = token::create_named_token(
            user,
            collection_name,
            metadata, // description
            token_name,
            option::none(), // royalty
            string::utf8(b""), // URI
        );

        let token_object = object::object_from_constructor_ref<token::Token>(
            &token_constructor_ref
        );
        let token_address = object::object_address(&token_object);

        // Store NFT data in token
        let token_signer = object::generate_signer(&token_constructor_ref);
        move_to(&token_signer, VoiceNFT {
            id: token_id,
            metadata,
        });

        // Store token address
        table::add(&mut data.tokens, token_id, token_address);

        // Initialize voting data
        let voting_data = borrow_global_mut<VotingData>(contract_address);
        table::add(&mut voting_data.vote_counts, token_id, VoteCounts {
            for_votes: 0,
            against_votes: 0,
        });

        // Update token counter
        data.next_token_id = token_id + 1;
    }

    /// Vote on NFT
    public entry fun vote_on_nft(
        user: &signer,
        token_id: u64,
        vote_for: bool,
    ) acquires VoiceNFTData, VotingData {
        let user_address = signer::address_of(user);
        let contract_address = @voice_nft;

        // Verify module initialized
        assert!(exists<VoiceNFTData>(contract_address), E_MODULE_NOT_INITIALIZED);

        // Check token exists
        let data = borrow_global<VoiceNFTData>(contract_address);
        assert!(table::contains(&data.tokens, token_id), E_TOKEN_NOT_FOUND);

        // Check if already voted
        let voting_data = borrow_global_mut<VotingData>(contract_address);
        let vote_key = UserVoteKey { user: user_address, token_id };
        assert!(
            !table::contains(&voting_data.user_votes, vote_key), 
            E_ALREADY_VOTED
        );

        // Record user vote
        table::add(&mut voting_data.user_votes, vote_key, vote_for);

        // Update vote counts
        let counts = table::borrow_mut(&mut voting_data.vote_counts, token_id);
        if (vote_for) {
            counts.for_votes = counts.for_votes + 1;
        } else {
            counts.against_votes = counts.against_votes + 1;
        };
    }

    /// Helper to convert u64 to string
    fun u64_to_string(value: u64): String {
        if (value == 0) return string::utf8(b"0");
        
        let digits = vector::empty<u8>();
        let temp = value;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // ASCII '0'
            vector::push_back(&mut digits, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut digits);
        string::utf8(digits)
    }

    /// Helper to convert address to string (simplified)
    fun address_to_string(addr: address): String {
        // For simplicity, we'll use a short representation
        let addr_bytes = bcs::to_bytes(&addr);
        let hex_chars = b"0123456789abcdef";
        let result = vector::empty<u8>();
        
        // Take first 4 bytes for a shorter representation
        let i = 0;
        while (i < 4 && i < vector::length(&addr_bytes)) {
            let byte = *vector::borrow(&addr_bytes, i);
            let high = byte / 16;
            let low = byte % 16;
            vector::push_back(&mut result, *vector::borrow(&hex_chars, (high as u64)));
            vector::push_back(&mut result, *vector::borrow(&hex_chars, (low as u64)));
            i = i + 1;
        };
        
        string::utf8(result)
    }

    #[view]
    /// Get NFT data by token ID
    public fun get_nft(token_id: u64): Option<VoiceNFT> acquires VoiceNFTData, VoiceNFT {
        let contract_address = @voice_nft;
        if (!exists<VoiceNFTData>(contract_address)) {
            return option::none()
        };
        
        let data = borrow_global<VoiceNFTData>(contract_address);
        if (table::contains(&data.tokens, token_id)) {
            let token_address = *table::borrow(&data.tokens, token_id);
            if (exists<VoiceNFT>(token_address)) {
                let nft = borrow_global<VoiceNFT>(token_address);
                option::some(*nft)
            } else {
                option::none()
            }
        } else {
            option::none()
        }
    }

    #[view]
    /// Get vote counts for NFT
    public fun get_votes(token_id: u64): Option<VoteCounts> acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return option::none()
        };
        
        let voting_data = borrow_global<VotingData>(contract_address);
        if (table::contains(&voting_data.vote_counts, token_id)) {
            let counts = table::borrow(&voting_data.vote_counts, token_id);
            option::some(*counts)
        } else {
            option::none()
        }
    }

    #[view]
    /// Check if user voted on NFT
    public fun has_user_voted(user: address, token_id: u64): bool acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return false
        };
        
        let voting_data = borrow_global<VotingData>(contract_address);
        table::contains(&voting_data.user_votes, UserVoteKey { user, token_id })
    }

    #[view]
    /// Get total NFTs minted
    public fun total_nfts(): u64 acquires VoiceNFTData {
        let contract_address = @voice_nft;
        if (!exists<VoiceNFTData>(contract_address)) {
            return 0
        };
        
        let data = borrow_global<VoiceNFTData>(contract_address);
        data.next_token_id - 1
    }

    #[view]
    /// Get user's vote direction
    public fun get_user_vote(
        user: address, 
        token_id: u64
    ): Option<bool> acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return option::none()
        };
        
        let voting_data = borrow_global<VotingData>(contract_address);
        let vote_key = UserVoteKey { user, token_id };
        if (table::contains(&voting_data.user_votes, vote_key)) {
            option::some(*table::borrow(&voting_data.user_votes, vote_key))
        } else {
            option::none()
        }
    }
}


okay so now i want you to integrate the mintnft function. use the same coding practice as the example code. mint the nft on clicking the button "Preserve & Create Podcast"
set the token uri metala data as savedLinks from the tsx. it is coming fromthe /api/generate-debate-podcast   basically set the url as the metadata. so as the button is clicked it takes in the url, shows petra wallet popup, takes approval and mints the nft.


"use client"

import { useState, useEffect } from "react"
import { Loader2, Play, Users, Plus, UserPlus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"

interface Leader {
  name: string
  prompt?: string
  image: string
  id: string
  specialty?: string
}

interface DebateMessage {
  id: string
  speaker: "bot1" | "bot2" | "conclusion"
  content: string
  timestamp: Date
}

interface DebateState {
  topic: string
  messages: DebateMessage[]
  isDebating: boolean
  currentRound: number
  phase: "setup" | "debating" | "concluded"
}

export default function DebateSystem() {
  const searchParams = useSearchParams()
  const [availableLeaders, setAvailableLeaders] = useState<Leader[]>([])
  const [leader1, setLeader1] = useState<Leader | null>(null)
  const [leader2, setLeader2] = useState<Leader | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState("")
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [createError, setCreateError] = useState("")
  const [audiogenerated, setAudioGenerated] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [debateState, setDebateState] = useState<DebateState>({
    topic: "",
    messages: [],
    isDebating: false,
    currentRound: 0,
    phase: "setup",
  })

  const [savingDebate, setSavingDebate] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedLinks, setSavedLinks] = useState<{ json?: string; audio?: string }>({})

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Load leaders from localStorage on component mount
  useEffect(() => {
    const storedLeaders =
      typeof window !== "undefined" && localStorage.getItem("leaders")
        ? JSON.parse(localStorage.getItem("leaders")!)
        : []

    setAvailableLeaders(storedLeaders)

    if (storedLeaders.length > 0) {
      setLeader1(storedLeaders[0])
      setLeader2(storedLeaders[1] || storedLeaders[0])
    }
  }, [])

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return

    setCreatingAgent(true)
    setCreateError("")

    try {
      const res = await fetch("/api/ai-personality-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newAgentName }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to create agent")
      }

      const newLeader: Leader = await res.json()

      // Save to localStorage
      const stored = localStorage.getItem("leaders")
      const storedLeaders: Leader[] = stored ? JSON.parse(stored) : []
      storedLeaders.push(newLeader)
      localStorage.setItem("leaders", JSON.stringify(storedLeaders))

      // Update available leaders (remove defaultLeaders reference)
      setAvailableLeaders(storedLeaders)

      // Reset form
      setNewAgentName("")
      setShowCreateAgent(false)

      // Auto-select the new agent if no agents were selected
      if (!leader1) setLeader1(newLeader)
      else if (!leader2) setLeader2(newLeader)
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreatingAgent(false)
    }
  }

  const startDebate = async () => {
    if (!debateState.topic.trim() || !leader1 || !leader2) return

    setDebateState((prev) => ({
      ...prev,
      isDebating: true,
      phase: "debating",
      messages: [],
      currentRound: 0,
    }))

    try {
      const response = await fetch("/api/ai-debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: debateState.topic, leader1: leader1, leader2: leader2 }),
      })

      if (!response.ok) throw new Error("Failed to start debate")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "message") {
                setDebateState((prev) => ({
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: Date.now().toString(),
                      speaker: data.speaker,
                      content: data.content,
                      timestamp: new Date(),
                    },
                  ],
                  currentRound: data.round,
                }))
              } else if (data.type === "conclusion") {
                setDebateState((prev) => ({
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: Date.now().toString(),
                      speaker: "conclusion",
                      content: data.content,
                      timestamp: new Date(),
                    },
                  ],
                  phase: "concluded",
                  isDebating: false,
                }))
              } else if (data.type === "complete") {
                setDebateState((prev) => ({
                  ...prev,
                  isDebating: false,
                  phase: "concluded",
                }))
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error starting debate:", error)
      setDebateState((prev) => ({
        ...prev,
        isDebating: false,
        phase: "setup",
      }))
    }
  }

  const resetDebate = () => {
    setDebateState({
      topic: "",
      messages: [],
      isDebating: false,
      currentRound: 0,
      phase: "setup",
    })
  }

  const saveDebateRecord = async () => {
    if (!leader1 || !leader2 || debateState.messages.length === 0) return

    setSavingDebate(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      // Format the debate data with better structure
      const debateData = {
        topic: debateState.topic,
        participants: [leader1.name, leader2.name],
        timestamp: new Date().toISOString(),
        dialogue: debateState.messages
          .filter((msg) => msg.speaker !== "conclusion")
          .reduce(
            (acc, msg) => {
              const speakerName = msg.speaker === "bot1" ? leader1.name : leader2.name
              acc[speakerName] = acc[speakerName] || []
              acc[speakerName].push(msg.content)
              return acc
            },
            {} as Record<string, string[]>,
          ),
        conclusion: debateState.messages.find((msg) => msg.speaker === "conclusion")?.content || "",
      }

      console.log("Saving debate data:", debateData)

      // Save JSON to Pinata
      const jsonResponse = await fetch("/api/save-debate-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debateData),
      })

      if (!jsonResponse.ok) {
        const errorData = await jsonResponse.json()
        throw new Error(errorData.error || "Failed to save debate JSON")
      }

      const jsonResult = await jsonResponse.json()
      console.log("JSON saved successfully:", jsonResult)

      // Generate podcast audio
      console.log("Generating podcast audio...")
      const audioResponse = await fetch("/api/generate-debate-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateData,
          leader1Voice: leader1.name,
          leader2Voice: leader2.name,
        }),
      })

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json()
        console.error("Audio generation error:", errorData)
        // Don't throw error here - we still have the JSON saved
        setSavedLinks({
          json: jsonResult.ipfsHash,
        })
        setSaveSuccess(true)
        setSaveError("Debate saved successfully, but podcast generation failed. You can still access the transcript.")
        return
      }

      const audioResult = await audioResponse.json()
      console.log("Audio generated successfully:", audioResult)
      setAudioGenerated(true)

      setAudioUrl(audioResult.filename)

      setSavedLinks({
        json: jsonResult.ipfsHash,
        audio: audioResult.ipfsHash,
      })
      setSaveSuccess(true)
    } catch (error: any) {
      console.error("Error saving debate:", error)
      setSaveError(error.message || "Failed to save debate record")
    } finally {
      setSavingDebate(false)
    }
  }

  const getSpeakerInfo = (speaker: string) => {
    switch (speaker) {
      case "bot1":
        return { name: leader1?.name || "Agent 1", color: "bg-gray-800", img: leader1?.image }
      case "bot2":
        return { name: leader2?.name || "Agent 2", color: "bg-gray-600", img: leader2?.image }
      case "conclusion":
        return { name: "Final Verdict", color: "bg-gray-900", avatar: "⚖️" }
      default:
        return { name: "Unknown", color: "bg-gray-500", avatar: "❓" }
    }
  }

  // No agents available state
  if (availableLeaders.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="dateline">{currentDate} — Agent Creation Bureau</div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">NO AGENTS PRESENT</h1>
              <p className="newspaper-subhead text-xl italic">Create Your First Artificial Intelligence Agent</p>
            </div>

            <div className="newspaper-article text-center py-16">
              <div className="newspaper-card-content">
                <UserPlus className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="newspaper-headline text-2xl mb-4">AGENT FACTORY AWAITS</h3>
                <p className="newspaper-body text-lg mb-8">
                  No artificial intelligence agents are currently available for debate. Create your first agent to begin
                  intellectual discourse.
                </p>

                <div className="max-w-md mx-auto mb-8">
                  <label className="block newspaper-subhead mb-3">Agent Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Winston Churchill, Marie Curie, etc."
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    disabled={creatingAgent}
                    className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white mb-4"
                  />

                  <button
                    onClick={handleCreateAgent}
                    disabled={creatingAgent || !newAgentName.trim()}
                    className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creatingAgent ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Manufacturing Agent...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Create First Agent</span>
                      </div>
                    )}
                  </button>
                </div>

                {createError && (
                  <div className="newspaper-card bg-red-50 border-red-400 max-w-md mx-auto">
                    <div className="newspaper-card-content">
                      <p className="text-red-800 newspaper-body">{createError}</p>
                    </div>
                  </div>
                )}

                <div className="classified-sidebar inline-block mt-8">
                  <h3 className="newspaper-subhead text-sm mb-3">AGENT SPECIFICATIONS</h3>
                  <div className="space-y-2 text-xs newspaper-body">
                    <p>
                      <strong>PERSONALITY:</strong> AI-generated based on historical figures
                    </p>
                    <p>
                      <strong>CAPABILITIES:</strong> Intelligent debate and discourse
                    </p>
                    <p>
                      <strong>STORAGE:</strong> Saved locally for future use
                    </p>
                    <p>
                      <strong>CUSTOMIZATION:</strong> Unique traits and perspectives
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-in">
          {/* Dateline */}
          <div className="dateline">{currentDate} — Intellectual Arena</div>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl newspaper-headline mb-4 flex items-center justify-center gap-3">
              <Users className="h-10 w-10" />
              ARTIFICIAL INTELLIGENCE DEBATE ARENA
            </h1>
            <p className="newspaper-subhead text-xl italic">Witness Mechanical Minds Engage in Scholarly Discourse</p>
          </div>

          {/* Agent Creation Section */}
          <div className="newspaper-card mb-8">
            <div className="newspaper-card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="newspaper-subhead text-lg">Available Agents: {availableLeaders.length}</h2>
                <button
                  onClick={() => setShowCreateAgent(!showCreateAgent)}
                  className="newspaper-btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Agent</span>
                </button>
              </div>

              {showCreateAgent && (
                <div className="border-t-2 border-gray-400 pt-4">
                  <h3 className="newspaper-subhead mb-3">Agent Manufacturing</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter agent name (e.g., Napoleon Bonaparte)"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      disabled={creatingAgent}
                      className="flex-1 p-3 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                    />
                    <button
                      onClick={handleCreateAgent}
                      disabled={creatingAgent || !newAgentName.trim()}
                      className="newspaper-btn-primary text-sm py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {creatingAgent ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        "Create Agent"
                      )}
                    </button>
                  </div>

                  {createError && (
                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-400">
                      <p className="text-red-800 newspaper-body text-sm">{createError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Leader Selection */}
          {debateState.phase === "setup" && (
            <div className="newspaper-article mb-8 animate-scale-in">
              <div className="newspaper-card-content">
                <h2 className="newspaper-headline text-2xl mb-8 text-center border-b-2 border-gray-400 pb-4">
                  SELECT YOUR DEBATING MACHINES
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">
                      FIRST ARTIFICIAL MIND
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableLeaders.map((leader) => (
                        <button
                          key={leader.id}
                          onClick={() => setLeader1(leader)}
                          className={`p-4 border-2 transition-all duration-300 ${
                            leader1?.id === leader.id
                              ? "border-gray-800 bg-gray-100"
                              : "border-gray-400 hover:border-gray-600 bg-white"
                          }`}
                        >
                          <Image
                            src={leader.image || "/placeholder.svg"}
                            alt={leader.name}
                            width={50}
                            height={50}
                            className="rounded-full mx-auto mb-3 border-2 border-gray-400"
                          />
                          <p className="text-sm newspaper-subhead text-center">{leader.name}</p>
                          <p className="text-xs newspaper-caption text-center mt-1">
                            {leader.specialty || "AI Persona"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">
                      SECOND ARTIFICIAL MIND
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableLeaders.map((leader) => (
                        <button
                          key={leader.id}
                          onClick={() => setLeader2(leader)}
                          className={`p-4 border-2 transition-all duration-300 ${
                            leader2?.id === leader.id
                              ? "border-gray-800 bg-gray-100"
                              : "border-gray-400 hover:border-gray-600 bg-white"
                          }`}
                        >
                          <Image
                            src={leader.image || "/placeholder.svg"}
                            alt={leader.name}
                            width={50}
                            height={50}
                            className="rounded-full mx-auto mb-3 border-2 border-gray-400"
                          />
                          <p className="text-sm newspaper-subhead text-center">{leader.name}</p>
                          <p className="text-xs newspaper-caption text-center mt-1">
                            {leader.specialty || "AI Persona"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
{/* <audio controls>
        <source src="/debate-podcast-1751752625607.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio> */}
                <div className="newspaper-divider"></div>

                {/* Topic Input */}
                <div className="mb-8">
                  <label className="block newspaper-subhead mb-3">Debate Topic for Artificial Minds</label>
                  <input
                    type="text"
                    placeholder="e.g., Should artificial intelligence replace human teachers?"
                    value={debateState.topic}
                    onChange={(e) => setDebateState((prev) => ({ ...prev, topic: e.target.value }))}
                    disabled={debateState.isDebating}
                    className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                  />
                </div>

                <button
                  onClick={startDebate}
                  disabled={
                    debateState.isDebating ||
                    !debateState.topic.trim() ||
                    !leader1 ||
                    !leader2 ||
                    leader1.id === leader2.id
                  }
                  className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {debateState.isDebating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Artificial Minds Debating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Activate Debate Machines</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Active Debate Interface */}
          {(debateState.phase === "debating" || debateState.phase === "concluded") && leader1 && leader2 && (
            <div className="space-y-6">
              {/* Debate Header */}
              <div className="newspaper-card">
                <div className="newspaper-card-content">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h2 className="newspaper-subhead text-xl mb-2">Current Debate Topic:</h2>
                      <p className="newspaper-body">{debateState.topic}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <span className="news-tag">Round {Math.ceil(debateState.currentRound / 2)}/10</span>
                      {debateState.phase === "concluded" && (
                        <button onClick={resetDebate} className="newspaper-btn-secondary text-sm py-2 px-4">
                          New Debate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Debater Info */}
                  <div className="flex items-center justify-between border-t-2 border-gray-400 pt-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={leader1.image || "/placeholder.svg"}
                        alt={leader1.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-gray-400"
                      />
                      <div>
                        <h3 className="newspaper-subhead">{leader1.name}</h3>
                        <p className="newspaper-caption">AI Persona #1</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-2xl">⚔️</span>
                      <p className="newspaper-caption">VERSUS</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <h3 className="newspaper-subhead">{leader2.name}</h3>
                        <p className="newspaper-caption">AI Persona #2</p>
                      </div>
                      <Image
                        src={leader2.image || "/placeholder.svg"}
                        alt={leader2.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Debate Transcript */}
              <div className="newspaper-article">
                <div className="newspaper-card-content">
                  <h3 className="newspaper-subhead mb-6 border-b-2 border-gray-400 pb-3 text-center">
                    OFFICIAL DEBATE TRANSCRIPT
                  </h3>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {debateState.messages.map((message) => {
                      const speakerInfo = getSpeakerInfo(message.speaker)
                      return (
                        <div key={message.id} className="newspaper-card">
                          <div className="newspaper-card-content">
                            <div className="flex items-start gap-4">
                              {speakerInfo.img ? (
                                <Image
                                  src={speakerInfo.img || "/placeholder.svg"}
                                  alt={speakerInfo.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full border-2 border-gray-400 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
                                  {speakerInfo.avatar}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3 border-b border-gray-300 pb-2">
                                  <h4 className="newspaper-subhead">{speakerInfo.name}</h4>
                                  <span className="newspaper-caption text-xs">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                  {message.speaker === "conclusion" && (
                                    <span className="news-tag text-xs">FINAL VERDICT</span>
                                  )}
                                </div>
                                <p className="newspaper-body leading-relaxed">
                                  {message.speaker === "conclusion" && (
                                    <span className="drop-cap">{message.content}</span>
                                  )}
                                  {message.speaker !== "conclusion" && message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {debateState.isDebating && (
                      <div className="newspaper-card border-dashed border-gray-400">
                        <div className="newspaper-card-content">
                          <div className="flex items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                            <div>
                              <p className="newspaper-subhead">Artificial Intelligence Processing...</p>
                              <p className="newspaper-caption">Mechanical minds formulating arguments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {debateState.messages.length === 0 && debateState.phase === "setup" && availableLeaders.length > 0 && (
            <div className="newspaper-article text-center py-16">
              <div className="newspaper-card-content">
                <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="newspaper-headline text-2xl mb-4">DEBATE ARENA AWAITS</h3>
                <p className="newspaper-body text-lg mb-6">
                  Configure your artificial debaters above and witness mechanical minds engage in scholarly discourse
                </p>

                <div className="classified-sidebar inline-block">
                  <h3 className="newspaper-subhead text-sm mb-3">ARENA SPECIFICATIONS</h3>
                  <div className="space-y-2 text-xs newspaper-body">
                    <p>
                      <strong>PARTICIPANTS:</strong> Two AI personas
                    </p>
                    <p>
                      <strong>FORMAT:</strong> Structured intellectual debate
                    </p>
                    <p>
                      <strong>DURATION:</strong> 10 rounds maximum
                    </p>
                    <p>
                      <strong>CONCLUSION:</strong> Automated verdict
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post-Debate Actions */}
      {debateState.phase === "concluded" && leader1 && leader2 && (
        <div className="newspaper-card text-center">
          <div className="newspaper-card-content">
            <h3 className="newspaper-headline text-xl mb-4">DEBATE CONCLUDED!</h3>
            <p className="newspaper-body mb-6">
              This historic discussion between {leader1?.name} and {leader2?.name} about{" "}
              {debateState.topic.toLowerCase()} is now ready to be preserved for posterity.
            </p>

            {!saveSuccess ? (
              <div className="space-y-4">
                <button
                  onClick={saveDebateRecord}
                  disabled={savingDebate}
                  className="newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {savingDebate ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Preserving Historical Record...</span>
                    </div>
                  ) : (
                    "Preserve & Create Podcast"
                  )}
                </button>

                {saveError && (
                  <div className="newspaper-card bg-red-50 border-red-400">
                    <div className="newspaper-card-content">
                      <p className="text-red-800 newspaper-body text-sm">{saveError}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="newspaper-card bg-green-50 border-green-400">
                  <div className="newspaper-card-content">
                    <h4 className="newspaper-subhead text-green-800 mb-3">Successfully Preserved!</h4>
                    <div className="space-y-3 text-sm">
                      {savedLinks.json && (
                        <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                          <span className="newspaper-body">Debate Transcript (JSON)</span>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${savedLinks.json}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="newspaper-btn-secondary text-xs py-1 px-3"
                          >
                            View Record
                          </a>

                        </div>
                      )}
                      {
                        audiogenerated && <>
                          <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                            <span className="newspaper-body">Debate Podcast (Audio)</span>
                            <a
                              href={audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="newspaper-btn-secondary text-xs py-1 px-3"
                            >
                              Listen

                            </a>
                            <audio controls>
        <source src={`${audioUrl}`} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
                          </div>
                        
                        </>
                      }
                      {savedLinks.audio && (
                        <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                          <span className="newspaper-body">Debate Podcast (Audio)</span>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${savedLinks.audio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="newspaper-btn-secondary text-xs py-1 px-3"
                          >
                            Listen
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={resetDebate} className="newspaper-btn-primary">
                  Start New Debate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



this is the frontend code. integrate the mint nft function. follow all the guidelines and return me the whole page.tsx dont change the ui.