import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Award, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    image: string;
    issuer: string;
    issuedDate: string;
    tokenId: string;
  };
}

const NFTCard = ({ nft }: NFTCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square w-full bg-slate-100">
        <img
          src={nft.image || "/placeholder.svg"}
          alt={nft.name}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700">
          Certificate
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-lg">{nft.name}</h3>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Issuer: </span>
            {nft.issuer}
          </p>
          <p>
            <span className="text-muted-foreground">Issued: </span>
            {nft.issuedDate}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Token ID: {nft.tokenId}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Blockchain
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
