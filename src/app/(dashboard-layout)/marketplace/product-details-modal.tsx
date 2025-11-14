"use client";

import * as React from "react";
import {
  IconPackage,
  IconUser,
  IconStar,
  IconDownload,
  IconShoppingCart,
  IconPhoto,
  IconTag,
  IconFileText,
  IconSettings,
  IconShield,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductService, ApiProductDetail } from "@/services/product.service";

interface ProductDetailsModalProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({
  productId,
  open,
  onOpenChange,
}: ProductDetailsModalProps) {
  const [productDetails, setProductDetails] =
    React.useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && productId) {
      fetchProductDetails();
    }
  }, [open, productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProductById(productId);
      setProductDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      toast.error("Failed to load product details", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://14.169.52.232:3005";
    return `${baseUrl}${path}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackage className="size-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the product
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ) : productDetails ? (
          <div className="space-y-6">
            {/* Product Title & Author */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {productDetails.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {productDetails.description}
                  </p>
                </div>
                {productDetails.discount && productDetails.discount > 0 && (
                  <Badge className="bg-red-500 text-white text-lg px-4 py-1">
                    -{productDetails.discount}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={getFullImageUrl(productDetails.author.avatar)}
                    />
                    <AvatarFallback>
                      {getInitials(productDetails.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {productDetails.author.name}
                      </span>
                      {productDetails.author.verified && (
                        <IconCheck className="size-4 text-blue-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {productDetails.author.totalProducts} products
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price & Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(productDetails.price)}
                    </p>
                    {productDetails.originalPrice &&
                      productDetails.originalPrice > productDetails.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(productDetails.originalPrice)}
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <IconStar className="size-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">
                      {productDetails.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({productDetails.reviewCount})
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <IconDownload className="size-4" />
                    Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {productDetails.downloads.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <IconShoppingCart className="size-4" />
                    Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {productDetails.sellCount.toLocaleString()} sold
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Product Images */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <IconPhoto className="size-4" />
                Product Images
              </h4>

              {/* Main Image */}
              {productDetails.image && (
                <div className="w-full rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={getFullImageUrl(productDetails.image)}
                    alt={productDetails.name}
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                </div>
              )}

              {/* Before/After Image Pairs */}
              {productDetails.imagePairs &&
                productDetails.imagePairs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Before & After Examples</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {productDetails.imagePairs.map((pair, index) => (
                        <div key={index} className="space-y-2">
                          <div className="rounded-lg overflow-hidden border">
                            <img
                              src={getFullImageUrl(pair.before)}
                              alt={`Before ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="bg-muted px-3 py-1 text-xs font-medium text-center">
                              Before
                            </div>
                          </div>
                          <div className="rounded-lg overflow-hidden border">
                            <img
                              src={getFullImageUrl(pair.after)}
                              alt={`After ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="bg-primary px-3 py-1 text-xs font-medium text-center text-primary-foreground">
                              After
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <Separator />

            {/* Product Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <IconTag className="size-4" />
                    Product Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="secondary">{productDetails.category}</Badge>
                    </div>
                    {productDetails.fileFormat && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-medium">
                          {productDetails.fileFormat}
                        </span>
                      </div>
                    )}
                    {productDetails.fileSize && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">File Size:</span>
                        <span className="font-medium">
                          {productDetails.fileSize}
                        </span>
                      </div>
                    )}
                    {productDetails.includesCount && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Includes:</span>
                        <span className="font-medium">
                          {productDetails.includesCount} presets
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {formatDate(productDetails.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {productDetails.tags && productDetails.tags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Compatibility */}
                {productDetails.compatibility &&
                  productDetails.compatibility.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <IconSettings className="size-4" />
                        Compatibility
                      </h4>
                      <div className="space-y-2">
                        {productDetails.compatibility.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <IconCheck className="size-4 text-green-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features */}
                {productDetails.features && productDetails.features.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Features</h5>
                    <div className="space-y-2">
                      {productDetails.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <IconCheck className="size-4 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {productDetails.specifications && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <IconFileText className="size-4" />
                    Specifications
                  </h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {productDetails.specifications.adjustments && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Adjustments</p>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.specifications.adjustments.map(
                            (adj, i) => (
                              <Badge key={i} variant="secondary">
                                {adj}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {productDetails.specifications.bestFor && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Best For</p>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.specifications.bestFor.map((item, i) => (
                            <Badge key={i} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {productDetails.specifications.difficulty && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Difficulty</p>
                        <Badge>{productDetails.specifications.difficulty}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Warranty */}
            {productDetails.warranty && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <IconShield className="size-4" />
                    Warranty & Support
                  </h4>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {productDetails.warranty.duration && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Duration
                            </p>
                            <p className="font-semibold">
                              {productDetails.warranty.duration}
                            </p>
                          </div>
                        )}
                        {productDetails.warranty.coverage && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Coverage
                            </p>
                            <p className="font-medium">
                              {productDetails.warranty.coverage}
                            </p>
                          </div>
                        )}
                        {productDetails.warranty.terms &&
                          productDetails.warranty.terms.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Terms
                              </p>
                              <ul className="space-y-2">
                                {productDetails.warranty.terms.map((term, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <IconCheck className="size-4 text-green-500 mt-0.5" />
                                    <span>{term}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Image Metadata */}
            {productDetails.imageMetadata && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Image Metadata</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {productDetails.imageMetadata.dimensions && (
                      <div className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Dimensions
                        </p>
                        <p className="text-sm font-semibold">
                          {productDetails.imageMetadata.dimensions}
                        </p>
                      </div>
                    )}
                    {productDetails.imageMetadata.format && (
                      <div className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Format
                        </p>
                        <p className="text-sm font-semibold">
                          {productDetails.imageMetadata.format}
                        </p>
                      </div>
                    )}
                    {productDetails.imageMetadata.fileSize && (
                      <div className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          File Size
                        </p>
                        <p className="text-sm font-semibold">
                          {(
                            productDetails.imageMetadata.fileSize /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    )}
                    {productDetails.imageMetadata.colorSpace && (
                      <div className="rounded-lg border p-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Color Space
                        </p>
                        <p className="text-sm font-semibold">
                          {productDetails.imageMetadata.colorSpace}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

