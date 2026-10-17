"use client";

import { type MatrixCell, PERMISSION_MATRIX_ROWS } from "@loftlancer/actions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@loftlancer/ui/table";

function cellLabel(cell: MatrixCell): string {
  if (cell === "Y") return "Yes";
  if (cell === "G") return "Granted";
  return "—";
}

export function OrganizationPermissionsMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission matrix</CardTitle>
        <CardDescription>
          Canonical actions and how built-in roles map to them.{" "}
          <strong>G</strong> means project assignment or explicit member grants.
          Platform <strong>Admin</strong> is reserved for a future console.
        </CardDescription>
      </CardHeader>
      <CardPanel className="p-4 pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERMISSION_MATRIX_ROWS.map((row) => (
              <TableRow key={row.action}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>{cellLabel(row.owner)}</TableCell>
                <TableCell>{cellLabel(row.manager)}</TableCell>
                <TableCell>{cellLabel(row.member)}</TableCell>
                <TableCell>{cellLabel(row.admin)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardPanel>
    </Card>
  );
}
