module voice_nft::voice_nft {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;

    /// Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_COLLECTION_NOT_FOUND: u64 = 2;
    const E_TOKEN_NOT_FOUND: u64 = 3;
    const E_INVALID_METADATA: u64 = 4;
    const E_ALREADY_VOTED: u64 = 5;
    const E_INVALID_TOKEN_ID: u64 = 6;

    /// NFT Metadata structure
    struct VoiceNFTMetadata has key, store, copy, drop {
        name: String,
        description: String,
        image: String,
        transcript: String,
        voice: String,
        minted_at: u64,
        token_id: u64,
    }

    /// Resource to store collection information
    struct VoiceNFTCollection has key {
        collection_object: Object<collection::Collection>,
        next_token_id: u64,
        total_minted: u64,
    }

    /// Resource to store user's NFT information
    struct UserNFTs has key {
        owned_tokens: vector<Object<token::Token>>,
    }

    /// Resource to store all NFTs in the contract
    struct AllNFTs has key {
        all_tokens: vector<Object<token::Token>>,
        token_metadata: vector<VoiceNFTMetadata>,
    }

    /// Vote counts for each NFT
    struct VoteCounts has key, store, copy, drop {
        for_votes: u64,
        against_votes: u64,
    }

    /// Resource to store voting data
    struct VotingData has key {
        nft_votes: vector<VoteCounts>, // Index corresponds to token_id - 1
        user_votes: vector<UserVote>, // Track all user votes
    }

    /// Individual user vote record
    struct UserVote has store, copy, drop {
        user_address: address,
        token_id: u64,
        vote_for: bool, // true for "for", false for "against"
    }

    /// Collection name and description
    const COLLECTION_NAME: vector<u8> = b"Voice NFT Collection";
    const COLLECTION_DESCRIPTION: vector<u8> = b"A collection of voice-based NFTs with metadata";
    const COLLECTION_URI: vector<u8> = b"https://voice-nft.com";

    /// Initialize the contract (called once on deployment)
    fun init_module(account: &signer) {
        let collection_constructor_ref = collection::create_unlimited_collection(
            account,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI),
        );

        let collection_object = object::object_from_constructor_ref<collection::Collection>(
            &collection_constructor_ref
        );

        move_to(account, VoiceNFTCollection {
            collection_object,
            next_token_id: 1,
            total_minted: 0,
        });

        move_to(account, AllNFTs {
            all_tokens: vector::empty(),
            token_metadata: vector::empty(),
        });

        move_to(account, VotingData {
            nft_votes: vector::empty(),
            user_votes: vector::empty(),
        });
    }

    /// Mint a new Voice NFT
    public entry fun mint_voice_nft(
        user: &signer,
        name: String,
        description: String,
        image: String,
        transcript: String,
        voice: String,
    ) acquires VoiceNFTCollection, UserNFTs, AllNFTs, VotingData {
        let user_address = signer::address_of(user);
        let contract_address = @voice_nft;

        // Validate metadata
        assert!(!string::is_empty(&name), E_INVALID_METADATA);
        assert!(!string::is_empty(&description), E_INVALID_METADATA);
        assert!(!string::is_empty(&image), E_INVALID_METADATA);

        // Get collection info
        let collection_ref = borrow_global_mut<VoiceNFTCollection>(contract_address);
        let token_id = collection_ref.next_token_id;
        
        // Create token name with ID - Fixed string concatenation
        let token_name = string::utf8(b"Voice NFT #");
        let token_id_str = u64_to_string(token_id);
        string::append(&mut token_name, token_id_str);
        
        // Create the token
        let token_constructor_ref = token::create_named_token(
            user,
            string::utf8(COLLECTION_NAME),
            description,
            token_name,
            option::none(),
            image,
        );

        let token_object = object::object_from_constructor_ref<token::Token>(
            &token_constructor_ref
        );

        // Create metadata
        let metadata = VoiceNFTMetadata {
            name,
            description,
            image,
            transcript,
            voice,
            minted_at: timestamp::now_seconds(),
            token_id,
        };

        // Store metadata in the token
        let token_signer = object::generate_signer(&token_constructor_ref);
        move_to(&token_signer, metadata);

        // Update collection info
        collection_ref.next_token_id = token_id + 1;
        collection_ref.total_minted = collection_ref.total_minted + 1;

        // Add to user's NFTs
        if (!exists<UserNFTs>(user_address)) {
            move_to(user, UserNFTs {
                owned_tokens: vector::empty(),
            });
        };
        let user_nfts = borrow_global_mut<UserNFTs>(user_address);
        vector::push_back(&mut user_nfts.owned_tokens, token_object);

        // Add to all NFTs
        let all_nfts = borrow_global_mut<AllNFTs>(contract_address);
        vector::push_back(&mut all_nfts.all_tokens, token_object);
        vector::push_back(&mut all_nfts.token_metadata, metadata);

        // Initialize voting data for this NFT
        let voting_data = borrow_global_mut<VotingData>(contract_address);
        vector::push_back(&mut voting_data.nft_votes, VoteCounts {
            for_votes: 0,
            against_votes: 0,
        });
    }

    /// Helper function to convert u64 to string
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };
        
        let digits = vector::empty<u8>();
        let temp = value;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // 48 is ASCII '0'
            vector::push_back(&mut digits, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut digits);
        string::utf8(digits)
    }

    #[view]
    /// View all NFTs owned by a user
    public fun get_user_nfts(user_address: address): vector<VoiceNFTMetadata> acquires UserNFTs, VoiceNFTMetadata {
        if (!exists<UserNFTs>(user_address)) {
            return vector::empty()
        };

        let user_nfts = borrow_global<UserNFTs>(user_address);
        let owned_tokens = &user_nfts.owned_tokens;
        let result = vector::empty<VoiceNFTMetadata>();

        let i = 0;
        let len = vector::length(owned_tokens);
        while (i < len) {
            let token = vector::borrow(owned_tokens, i);
            let token_address = object::object_address(token);
            
            if (exists<VoiceNFTMetadata>(token_address)) {
                let metadata = borrow_global<VoiceNFTMetadata>(token_address);
                vector::push_back(&mut result, *metadata);
            };
            i = i + 1;
        };

        result
    }

    #[view]
    /// View all NFTs in the contract
    public fun get_all_nfts(): vector<VoiceNFTMetadata> acquires AllNFTs {
        let contract_address = @voice_nft;
        if (!exists<AllNFTs>(contract_address)) {
            return vector::empty()
        };

        let all_nfts = borrow_global<AllNFTs>(contract_address);
        all_nfts.token_metadata
    }

    #[view]
    /// Get total number of NFTs minted
    public fun get_total_minted(): u64 acquires VoiceNFTCollection {
        let contract_address = @voice_nft;
        if (!exists<VoiceNFTCollection>(contract_address)) {
            return 0
        };

        let collection = borrow_global<VoiceNFTCollection>(contract_address);
        collection.total_minted
    }

    #[view]
    /// Get user's NFT count
    public fun get_user_nft_count(user_address: address): u64 acquires UserNFTs {
        if (!exists<UserNFTs>(user_address)) {
            return 0
        };

        let user_nfts = borrow_global<UserNFTs>(user_address);
        vector::length(&user_nfts.owned_tokens)
    }

    #[view]
    /// Get NFT metadata by token object
    public fun get_nft_metadata(token_address: address): Option<VoiceNFTMetadata> acquires VoiceNFTMetadata {
        if (exists<VoiceNFTMetadata>(token_address)) {
            let metadata = borrow_global<VoiceNFTMetadata>(token_address);
            option::some(*metadata)
        } else {
            option::none()
        }
    }

    #[view]
    /// Check if user owns a specific NFT
    public fun user_owns_nft(user_address: address, token_id: u64): bool acquires UserNFTs, VoiceNFTMetadata {
        if (!exists<UserNFTs>(user_address)) {
            return false
        };

        let user_nfts = borrow_global<UserNFTs>(user_address);
        let owned_tokens = &user_nfts.owned_tokens;

        let i = 0;
        let len = vector::length(owned_tokens);
        while (i < len) {
            let token = vector::borrow(owned_tokens, i);
            let token_address = object::object_address(token);
            
            if (exists<VoiceNFTMetadata>(token_address)) {
                let metadata = borrow_global<VoiceNFTMetadata>(token_address);
                if (metadata.token_id == token_id) {
                    return true
                };
            };
            i = i + 1;
        };

        false
    }

    /// Vote for or against an NFT
    public entry fun vote_on_nft(
        user: &signer,
        token_id: u64,
        vote_for: bool, // true for "for", false for "against"
    ) acquires VotingData, VoiceNFTCollection {
        let user_address = signer::address_of(user);
        let contract_address = @voice_nft;

        // Check if token_id exists
        let collection = borrow_global<VoiceNFTCollection>(contract_address);
        assert!(token_id > 0 && token_id < collection.next_token_id, E_INVALID_TOKEN_ID);

        let voting_data = borrow_global_mut<VotingData>(contract_address);
        
        // Check if user already voted on this NFT
        assert!(!has_user_voted(user_address, token_id, &voting_data.user_votes), E_ALREADY_VOTED);

        // Add user vote record
        vector::push_back(&mut voting_data.user_votes, UserVote {
            user_address,
            token_id,
            vote_for,
        });

        // Update vote counts (token_id - 1 because vector is 0-indexed)
        let vote_counts = vector::borrow_mut(&mut voting_data.nft_votes, token_id - 1);
        if (vote_for) {
            vote_counts.for_votes = vote_counts.for_votes + 1;
        } else {
            vote_counts.against_votes = vote_counts.against_votes + 1;
        };
    }

    /// Helper function to check if user has already voted on an NFT
    fun has_user_voted(user_address: address, token_id: u64, user_votes: &vector<UserVote>): bool {
        let i = 0;
        let len = vector::length(user_votes);
        while (i < len) {
            let vote = vector::borrow(user_votes, i);
            if (vote.user_address == user_address && vote.token_id == token_id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    #[view]
    /// Get vote counts for a specific NFT
    public fun get_nft_vote_counts(token_id: u64): (u64, u64) acquires VotingData, VoiceNFTCollection {
        let contract_address = @voice_nft;
        
        // Check if token_id exists
        let collection = borrow_global<VoiceNFTCollection>(contract_address);
        assert!(token_id > 0 && token_id < collection.next_token_id, E_INVALID_TOKEN_ID);

        if (!exists<VotingData>(contract_address)) {
            return (0, 0)
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        let vote_counts = vector::borrow(&voting_data.nft_votes, token_id - 1);
        (vote_counts.for_votes, vote_counts.against_votes)
    }

    #[view]
    /// Get all vote counts for all NFTs
    public fun get_all_vote_counts(): vector<VoteCounts> acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return vector::empty()
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        voting_data.nft_votes
    }

    #[view]
    /// Check if a user has voted on a specific NFT
    public fun has_user_voted_on_nft(user_address: address, token_id: u64): bool acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return false
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        has_user_voted(user_address, token_id, &voting_data.user_votes)
    }

    #[view]
    /// Get user's vote on a specific NFT (returns option with vote_for boolean)
    public fun get_user_vote_on_nft(user_address: address, token_id: u64): Option<bool> acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return option::none()
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        let user_votes = &voting_data.user_votes;
        
        let i = 0;
        let len = vector::length(user_votes);
        while (i < len) {
            let vote = vector::borrow(user_votes, i);
            if (vote.user_address == user_address && vote.token_id == token_id) {
                return option::some(vote.vote_for)
            };
            i = i + 1;
        };
        
        option::none()
    }

    #[view]
    /// Get all votes by a user
    public fun get_user_votes(user_address: address): vector<UserVote> acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return vector::empty()
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        let user_votes = &voting_data.user_votes;
        let result = vector::empty<UserVote>();
        
        let i = 0;
        let len = vector::length(user_votes);
        while (i < len) {
            let vote = vector::borrow(user_votes, i);
            if (vote.user_address == user_address) {
                vector::push_back(&mut result, *vote);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    /// Get total number of votes across all NFTs
    public fun get_total_votes(): u64 acquires VotingData {
        let contract_address = @voice_nft;
        if (!exists<VotingData>(contract_address)) {
            return 0
        };

        let voting_data = borrow_global<VotingData>(contract_address);
        vector::length(&voting_data.user_votes)
    }
}