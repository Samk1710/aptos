module voice_nft::voice_nft {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
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
        let _user_address = signer::address_of(user);
        let contract_address = @voice_nft;

        // Validate metadata
        assert!(!string::is_empty(&metadata), E_INVALID_METADATA);

        // Verify module initialized
        assert!(exists<VoiceNFTData>(contract_address), E_MODULE_NOT_INITIALIZED);

        // Get next token ID
        let data = borrow_global_mut<VoiceNFTData>(contract_address);
        let token_id = data.next_token_id;

        // Create token name
        let token_name = string::utf8(b"Voice NFT #");
        string::append(&mut token_name, u64_to_string(token_id));
        
        // Create collection first if needed
        let _collection_constructor_ref = collection::create_unlimited_collection(
            user,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        // Create token
        let token_constructor_ref = token::create_named_token(
            user,
            string::utf8(COLLECTION_NAME),
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