import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApprovalSectionProps {
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  onPreparedByChange?: (value: string) => void;
  onReviewedByChange?: (value: string) => void;
  onApprovedByChange?: (value: string) => void;
}

const ApprovalSection = ({
  preparedBy = "",
  reviewedBy = "",
  approvedBy = "",
  onPreparedByChange = () => {},
  onReviewedByChange = () => {},
  onApprovedByChange = () => {},
}: ApprovalSectionProps) => {
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Approval Section</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Prepared/Requested By */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="preparedBy">Prepared/Requested By</Label>
            <Input
              id="preparedBy"
              placeholder="Enter name"
              value={preparedBy}
              onChange={(e) => onPreparedByChange(e.target.value)}
            />
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="text-sm text-gray-500">Signature</div>
              <div className="h-16 border border-dashed border-gray-300 rounded-md mt-1 flex items-center justify-center">
                <Button variant="outline" size="sm" className="text-xs">
                  Add Signature
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {preparedBy || "Name will appear here"}
              </div>
            </div>
          </div>

          {/* Reviewed By */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="reviewedBy">Reviewed By</Label>
            <Input
              id="reviewedBy"
              placeholder="Enter name"
              value={reviewedBy}
              onChange={(e) => onReviewedByChange(e.target.value)}
            />
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="text-sm text-gray-500">Signature</div>
              <div className="h-16 border border-dashed border-gray-300 rounded-md mt-1 flex items-center justify-center">
                <Button variant="outline" size="sm" className="text-xs">
                  Add Signature
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {reviewedBy || "Name will appear here"}
              </div>
            </div>
          </div>

          {/* Approved By */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="approvedBy">Approved By</Label>
            <Input
              id="approvedBy"
              placeholder="Enter name"
              value={approvedBy}
              onChange={(e) => onApprovedByChange(e.target.value)}
            />
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="text-sm text-gray-500">Signature</div>
              <div className="h-16 border border-dashed border-gray-300 rounded-md mt-1 flex items-center justify-center">
                <Button variant="outline" size="sm" className="text-xs">
                  Add Signature
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {approvedBy || "Name will appear here"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalSection;
