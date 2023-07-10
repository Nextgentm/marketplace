// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "./interface/ITransferProxy.sol";

contract Trade is AccessControl {
    enum BuyingAssetType {
        ERC1155,
        ERC721
    }
    enum Status {
        NONE,
        LIVE,
        COMPLETED,
        CANCEL
    }

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event SellerFee(uint8 sellerFee);
    event BuyerFee(uint8 buyerFee);
    event BuyAsset(
        address indexed assetOwner,
        uint256 indexed tokenId,
        uint256 quantity,
        address indexed buyer
    );
    event ExecuteBid(
        address indexed assetOwner,
        uint256 indexed tokenId,
        uint256 quantity,
        address indexed buyer
    );
    // buyer platformFee
    uint8 private buyerFeePermille;
    //seller platformFee
    uint8 private sellerFeePermille;
    ITransferProxy public transferProxy;
    //contract owner
    address public owner;

    address public signer;

    //// mapping(uint256 => bool) private usedNonce;

    // Create a new role identifier for the minter role
    //// bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /** Fee Struct
        @param platformFee  uint256 (buyerFee + sellerFee) value which is transferred to current contract owner.
        @param assetFee  uint256  assetvalue which is transferred to current seller of the NFT.
        @param royaltyFee  uint256 value, transferred to Minter of the NFT.
        @param price  uint256 value, the combination of buyerFee and assetValue.
        @param tokenCreator address value, it's store the creator of NFT.
     */
    struct Fee {
        uint256 platformFee;
        uint256 assetFee;
        uint256 royaltyFee;
        uint256 price;
        address tokenCreator;
    }

    /** Order Params
        @param seller address of user,who's selling the NFT.
        @param buyer address of user, who's buying the NFT.
        @param erc20Address address of the token, which is used as payment token(WETH/WBNB/WMATIC...)
        @param nftAddress address of NFT contract where the NFT token is created/Minted.
        @param nftType an enum value, if the type is ERC721/ERC1155 the enum value is 0/1.
        @param uintprice the Price Each NFT it's not including the buyerFee.
        @param nftAmount the max Quantity of NFT available for order.
        @param skipRoyalty skip royalty part or not.
        @param startDate the start Date of the order.
        @param endDate the end Date of the order.
        @param tokenId 
        @param amount the price of NFT(assetFee + buyerFee).
        @param qty number of quantity to be transfer.
        @param sellerOrdersignature order hash signed by seller.
        @param buyerOrdersignature order hash signed by buyer.
     */
    struct Order {
        address seller;
        address buyer;
        address erc20Address;
        address nftAddress;
        BuyingAssetType nftType;
        uint256 unitPrice;
        uint256 nftAmount;
        bool skipRoyalty;
        uint256 startDate;
        uint256 endDate;
        uint256 tokenId;
        uint256 amount;
        uint256 qty;
        bytes sellerOrdersignature;
        bytes buyerOrdersignature;
    }

    /** OrderStatus Params
        @param maxAmount is the maximum nft currently available in auction.
        @param status an enum value, if the type is NONE|LIVE|COMPLETED|CANCEL the enum value is 0|1|2|3.
     */
    struct OrderStatus {
        uint256 maxAmount;
        Status status;
    }

    // order Limit which hold closed and live order data
    mapping(bytes32 => OrderStatus) orderLimit;

    constructor(
        uint8 _buyerFee,
        uint8 _sellerFee,
        ITransferProxy _transferProxy
    ) {
        buyerFeePermille = _buyerFee;
        sellerFeePermille = _sellerFee;
        transferProxy = _transferProxy;
        owner = msg.sender;
    }

    modifier OnlyOwner(){
        require(msg.sender==owner,"Only owner can all this function");
        _;
    }

    modifier OnlySigner(){
        require(msg.sender==signer,"Only signer can all this function");
        _;
    }

    /**
        checks the order is valid
     */
    modifier isvalidOrder(Order calldata order) {
        require(order.seller != address(0), "Seller cannot be empty");
        require(order.buyer != address(0), "Buyer cannot be empty");
        require(order.nftAddress != address(0), "NFT Address cannot be empty");
        require(
            order.startDate <= block.timestamp,
            "Auction is not started yet"
        );
        require(block.timestamp < order.endDate, "Auction is ended");
        require(order.unitPrice > 0, "Unit price cannot be zero");
        require(order.tokenId > 0, "TokenId cannot be zero");
        require(order.amount > 0, "Amount cannot be zero");
        require(order.qty > 0, "Quantity cannot be zero");
        _;
    }

    /**
        checks the order is valid
     */
    modifier isvalidOrderBid(Order calldata order) {
        bytes32 buyerOrderhash = getOrderBuyerHash(order);
        bytes32 buyerOrderhashMessage = prefixed(buyerOrderhash);

        require(
            order.buyer ==
                recoverSigner(buyerOrderhashMessage, order.buyerOrdersignature),
            "Invalid bid details"
        );
        _;
    }

    /**
        returns the buyerservice Fee in multiply of 1000.
     */
    function buyerServiceFee() external view virtual returns (uint8) {
        return buyerFeePermille;
    }

    /**
        returns the sellerservice Fee in multiply of 1000.
     */
    function sellerServiceFee() external view virtual returns (uint8) {
        return sellerFeePermille;
    }

    /**
        returns the buyerservice Fee in multiply of 1000.
     */

    function setBuyerServiceFee(uint8 _buyerFeePermille) public OnlyOwner() {
        require(buyerFeePermille!=_buyerFeePermille,"BuyerFeePermille value is same");
        buyerFeePermille=_buyerFeePermille;
    }

    /**
        returns the sellerservice Fee in multiply of 1000.
     */

    function setSellerServiceFee(uint8 _sellerFeePermille) public OnlyOwner() {
        require(sellerFeePermille!=_sellerFeePermille,"SellerFeePermille value is same");
        sellerFeePermille=_sellerFeePermille;
    }
    /**
        set the signer in address.
     */

    function setSigner(address _signer) public OnlyOwner() {
        require(signer!=_signer,"Signer value is same");
        signer=_signer;
    }

    /**
        returns the whether the order is already exists or not.
     */
    function isOrderClosed(bytes32 orderHash) public view returns (bool) {
        return
            orderLimit[orderHash].status == Status.COMPLETED ||
            orderLimit[orderHash].status == Status.CANCEL;
    }

    /**
        cancel Order.
        @param order ordervalues(seller, buyer,...).
        this will cancel the invalid use of sign order data
    */
    function cancelOrder(Order calldata order) public returns (bool) {
        bytes32 sellerOrderhash = getOrderSellerHash(order);
        bytes32 sellerOrderhashMessage = prefixed(sellerOrderhash);

        require(order.seller == msg.sender, "Caller is not order seller");
        require(
            order.seller ==
                recoverSigner(
                    sellerOrderhashMessage,
                    order.sellerOrdersignature
                ),
            "Invalid order details"
        );
        require(
            !isOrderClosed(sellerOrderhashMessage),
            "Order already complted or cancel"
        );

        // if order is new or live then set its status and max amount
        orderLimit[sellerOrderhashMessage].maxAmount = 0;
        orderLimit[sellerOrderhashMessage].status = Status.CANCEL;

        return true;
    }

    /**
        validate and Update Order Limit.
        @param order ordervalues(seller, buyer,...).
        this will validate and update the signature of order for seller
    */
    function validateandUpdateOrderForSeller(Order calldata order)
        public
        returns (bool)
    {
        bytes32 sellerOrderhash = getOrderSellerHash(order);
        bytes32 sellerOrderhashMessage = prefixed(sellerOrderhash);

        require(
            order.seller ==
                recoverSigner(
                    sellerOrderhashMessage,
                    order.sellerOrdersignature
                ),
            "Invalid order details"
        );
        require(!isOrderClosed(sellerOrderhashMessage), "Order closed");

        // if order is new then set its status and max amount
        if (orderLimit[sellerOrderhashMessage].status == Status.NONE) {
            orderLimit[sellerOrderhashMessage].maxAmount = order.nftAmount;
            orderLimit[sellerOrderhashMessage].status = Status.LIVE;
        } else if (orderLimit[sellerOrderhashMessage].status == Status.LIVE) {
            require(
                orderLimit[sellerOrderhashMessage].maxAmount >= order.qty,
                "Order Quantity is invalid"
            );
            // if order is live then update max amount
            uint256 _updatedMaxAmount = orderLimit[sellerOrderhashMessage]
                .maxAmount - order.qty;
            if (_updatedMaxAmount == 0) {
                // if order max amount will be zero then set status to completed
                orderLimit[sellerOrderhashMessage].status = Status.COMPLETED;
            }
            orderLimit[sellerOrderhashMessage].maxAmount = _updatedMaxAmount;
        }

        return true;
    }

    /**
        excuting the NFT order.
        @param order ordervalues(seller, buyer,...).
    */
    function buyAsset(Order calldata order)
        external
        isvalidOrder(order)
        returns (bool)
    {
        require(msg.sender==order.buyer,"Only order buyer can call this method");
        Fee memory fee = getFees(order);
        require(
            (fee.price <= order.unitPrice * order.qty),
            "Paid invalid amount"

        );
        if (validateandUpdateOrderForSeller(order)) {
            tradeAsset(order, fee, order.buyer, order.seller);
            emit BuyAsset(order.seller, order.tokenId, order.qty, order.buyer);
            return true;
        }
        return false;
    }

    function executeBid(Order calldata order)
        external
        isvalidOrder(order)
        isvalidOrderBid(order)
        returns (bool)
    {
        require(msg.sender==order.seller,"Only order seller can call this method");
        Fee memory fee = getFees(order);
        tradeAsset(order, fee, order.buyer, order.seller);
        emit ExecuteBid(order.seller, order.tokenId, order.qty, order.buyer);
        return true;
    }

    function getFees(Order calldata order) public view returns (Fee memory) {
        address tokenCreator;
        uint256 platformFee;
        uint256 royaltyFee;
        uint256 assetFee;
        uint256 price = (order.amount * 1000) / (1000 + buyerFeePermille);
        uint256 buyerFee = order.amount - price;
        uint256 sellerFee = (price * sellerFeePermille) / 1000;
        platformFee = buyerFee + sellerFee;
        if (
            !order.skipRoyalty &&
            ((order.nftType == BuyingAssetType.ERC721) ||
                (order.nftType == BuyingAssetType.ERC1155))
        ) {
            (tokenCreator, royaltyFee) = IERC2981(order.nftAddress).royaltyInfo(
                order.tokenId,
                price
            );
        }
        assetFee = price - royaltyFee - sellerFee;
        return Fee(platformFee, assetFee, royaltyFee, price, tokenCreator);
    }

    /** 
        transfers the NFTs and tokens...
        @param order ordervalues(seller, buyer,...).
        @param fee Feevalues(platformFee, assetFee,...).
    */

    function tradeAsset(
        Order calldata order,
        Fee memory fee,
        address buyer,
        address seller
    ) internal virtual {
        if (order.nftType == BuyingAssetType.ERC721) {
            transferProxy.erc721safeTransferFrom(
                IERC721(order.nftAddress),
                seller,
                buyer,
                order.tokenId
            );
        }
        if (order.nftType == BuyingAssetType.ERC1155) {
            transferProxy.erc1155safeTransferFrom(
                IERC1155(order.nftAddress),
                seller,
                buyer,
                order.tokenId,
                order.qty,
                ""
            );
        }

        if (fee.platformFee > 0) {
            transferProxy.erc20safeTransferFrom(
                IERC20(order.erc20Address),
                buyer,
                owner,
                fee.platformFee
            );
        }
        if (fee.royaltyFee > 0 && (!order.skipRoyalty)) {
            transferProxy.erc20safeTransferFrom(
                IERC20(order.erc20Address),
                buyer,
                fee.tokenCreator,
                fee.royaltyFee
            );
        }
        transferProxy.erc20safeTransferFrom(
            IERC20(order.erc20Address),
            buyer,
            seller,
            fee.assetFee
        );
    }

    // moonpay
    /** 
        transfers the NFTs by external wallets
        @param order ordervalues(seller, buyer,...).
    */
    function deliverNFT(Order calldata order)
        external
        OnlySigner()
        returns (bool)
    {
        if (order.nftType == BuyingAssetType.ERC721) {
            transferProxy.erc721safeTransferFrom(
                IERC721(order.nftAddress),
                order.seller,
                order.buyer,
                order.tokenId
            );
        }
        if (order.nftType == BuyingAssetType.ERC1155) {
            transferProxy.erc1155safeTransferFrom(
                IERC1155(order.nftAddress),
                order.seller,
                order.buyer,
                order.tokenId,
                order.qty,
                ""
            );
        }

        emit BuyAsset(order.seller, order.tokenId, order.qty, order.buyer);
        return true;
    }

    // Signature validation part

    /**
        get Order Hash for seller.
        @param order ordervalues(seller, buyer,...).
    */
    function getOrderSellerHash(Order calldata order)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    order.seller,
                    order.erc20Address,
                    order.nftAddress,
                    order.nftType,
                    order.unitPrice,
                    order.nftAmount,
                    order.skipRoyalty,
                    order.startDate,
                    order.endDate,
                    order.tokenId
                )
            );
    }

    /**
        get Order Hash for buyer.
        @param order ordervalues(seller, buyer,...).
    */
    function getOrderBuyerHash(Order calldata order)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    order.buyer,
                    order.erc20Address,
                    order.nftAddress,
                    order.nftType,
                    order.unitPrice,
                    order.tokenId,
                    order.amount,
                    order.qty
                )
            );
    }

    function prefixed(bytes32 _messageHash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function recoverSigner(bytes32 _signedMessageHash, bytes memory _signature)
        internal
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_signedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}
