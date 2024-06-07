# Solana Token Scanner

## Overview

The **Solana Token Scanner** is a tool designed to interact with the Solana blockchain to fetch and display information about specific tokens. It provides detailed metadata about tokens, including their liquidity in USD and the latest buy transactions. This tool is especially useful for developers and users who need to monitor token activity on the Solana network.

## Features

- **Fetch Token Metadata**: Retrieves and displays details such as token name, symbol, and liquidity in USD.
- **Latest Buy Transaction**: Identifies and shows the most recent buy transaction for a specified token, including details like sender, recipient, and amount.
- **Configurable Connection**: Easily connects to different Solana RPC URLs by adjusting environment settings.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **NestJS**: The application is built with the NestJS framework. You can learn more and install it from [nestjs.com](https://nestjs.com/).

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/just2102/Solana-Token-Scanner.git
   cd Solana-Token-Scanner
   ```

2. **Install Dependencies**

   ```bash
   yarn
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and add your Solana RPC URL:

   ```plaintext
   SOLANA_URL=https://api.mainnet-beta.solana.com
   ```

## Usage

1. **Run the Application**

   To start the application and fetch token information, use:

   ```bash
   yarn start:dev
   ```

2. **Fetch Token Information**

   You can fetch token details by sending a GET request to the `/token` endpoint. For example:

   ```bash
   curl -X GET http://localhost:3000/token/<TOKEN_ADDRESS>
   ```

   Replace `<TOKEN_ADDRESS>` with the actual token address you want to query.

3. **Example Command**

   ```bash
   curl -X GET http://localhost:3000/token/EXAMPLE_TOKEN_ADDRESS
   ```

   This will return a JSON response with token liquidity in USD and the latest buy transaction details.

## API Endpoints

- **GET /token**: Fetches metadata and the latest buy transaction for a specified token.

  - **Parameters**:

    - `token` (required): The public key of the token.

  - **Response**:
    ```json
    {
      "liquidity": 12345.67,
      "latestBuyTx": {
        "hash": "3G76Hx...",
        "slot": 12345678,
        "sender": "8F8A9V...",
        "recipient": "9G9B9C...",
        "amount": "100.00",
        "dapp": "4K7L5M..."
      }
    }
    ```

## Code Overview

### `AppService` Class

- **Constructor**: Initializes the Solana connection using the RPC URL provided in the environment variables.
- **`getToken` Method**: Fetches token information, including liquidity in USD and the latest buy transaction.
- **`getLatestTxForToken` Method**: Retrieves the most recent buy transaction for a specified token.
- **`fetchRecentSignatures` Method**: Fetches recent transaction signatures for a given token.
- **`fetchTransactions` Method**: Fetches transaction details using the signatures obtained.
- **`findLatestBuyTx` Method**: Analyzes transactions to find and return the most recent buy transaction for the specified token.

### `AppController` Class

- **`getToken` Method**: Endpoint to fetch token metadata and latest buy transaction.

### Data Structures

- **`GetTokenResponseDto`**: Data transfer object for returning token metadata and the latest buy transaction.
- **`ScreenerResponse`**: Interface for handling the response from the external API providing token data.
- **`LatestTx`**: Interface for the details of the latest buy transaction.

## Configuration

- **`SOLANA_URL`**: Set this to your desired Solana RPC URL to connect to the Solana blockchain network.

## Contributing

1. **Fork the Repository**
2. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

Special thanks to the Solana community for providing extensive documentation and support.
