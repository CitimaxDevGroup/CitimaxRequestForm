import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, PrinterIcon } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl"> {/* Increased max width for better readability */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Citimax Group Inc.
          </CardTitle>
          <p className="text-muted-foreground">Management System</p>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          {/* Development Disclaimer */}
          <Alert variant="warning" className="text-left">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Notice: Ongoing Development</AlertTitle>
            <AlertDescription>
              This system is currently under active development. 
              Features may change without notice. Please report any 
              issues to the IT department.
            </AlertDescription>
          </Alert>

          {/* Printing Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <PrinterIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Important Printing Instructions
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-700">
                  <li>Complete all required fields in the requisition form</li>
                  <li>
                    Before submitting, press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md">Ctrl + P</kbd> to print
                  </li>
                  <li>
                    Select "Save as PDF" in your printer options to keep a digital copy
                  </li>
                  <li>Keep a physical copy for your records if needed</li>
                  <li>After printing, click "Submit" in the system</li>
                  <li>This is solely for data collection.</li>
                </ol>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/requisition")} 
            className="w-full py-6 text-lg" // Larger button for emphasis
          >
            Create Requisition Form
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Welcome to the Citimax Group requisition management system
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;