import { Link } from "react-router-dom";
import { Percent, Users, Store } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";

const Commissions = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Commissions</h1>
            <p className="page-description">
              Platform fee is set per beautician (share of service revenue for the platform). Vendor commission is set per
              vendor: it is the percentage of the vendor&apos;s beauticians&apos; earnings that is credited to the vendor.
              There is no single global rate—open a profile to view or change it.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Per-beautician platform fee</h2>
              <p className="text-sm text-muted-foreground">
                Used in the beautician app for earnings estimates (service revenue). Edit on each beautician&apos;s detail page.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/beauticians">
              <Users className="h-4 w-4 mr-2" />
              Open beauticians
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Store className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Per-vendor commission</h2>
              <p className="text-sm text-muted-foreground">
                How much of each beautician&apos;s earnings (under that vendor) goes to the vendor—set when adding or
                editing a vendor (0–100%).
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/vendors">
              <Store className="h-4 w-4 mr-2" />
              Open vendors
            </Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Commissions;
