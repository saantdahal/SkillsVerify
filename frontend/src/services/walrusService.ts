const AGGREGATOR_URL = "https://aggregator.testnet.walrus.atalma.io";
const PUBLISHER_URL = "https://publisher.testnet.walrus.atalma.io";

const uploadToWalrus = async (textContent: string) => {
  const blob = new Blob([textContent], { type: "text/plain" });
  try {
    const response = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=5`, {
      method: "PUT",
      body: blob,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return result;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
};

const fetchFromWalrus = async (blobId: string): Promise<string> => {
  try {
    const response = await fetch(`${AGGREGATOR_URL}/v1/blobs/${blobId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    const content = await response.text();
    console.log("Fetched blob content:", content);
    return content;
  } catch (err) {
    console.error("Error fetching blob:", err);
    return "Error fetching blob content.";
  }
};

export { uploadToWalrus, fetchFromWalrus };