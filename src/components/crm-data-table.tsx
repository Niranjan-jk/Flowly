'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react"
import { 
  IconBrandYoutube, 
  IconBrandInstagram, 
  IconBrandTwitter, 
  IconBrandTiktok 
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RainbowButton } from "@/components/magicui/rainbow-button"

export type CRMClient = {
  id: string
  channel_name: string
  subscribers: number
  social_links: {
    youtube?: string
    instagram?: string
    twitter?: string
    tiktok?: string
  }
  email: string | null
  status: 'Started' | 'Idle' | 'Closed'
  client_details: {
    name: string
    company?: string
    phone?: string
    notes?: string
  }
  budget_score: number
  created_at: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Started':
      return 'bg-green-500/20 text-green-700 border-green-500/30'
    case 'Idle':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
    case 'Closed':
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
  }
}

const SocialIcon = ({ platform, url }: { platform: string; url?: string }) => {
  if (!url) return null

  const Icon = {
    youtube: IconBrandYoutube,
    instagram: IconBrandInstagram,
    twitter: IconBrandTwitter,
    tiktok: IconBrandTiktok,
  }[platform]

  if (!Icon) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-1 rounded-full hover:bg-gray-600 transition-colors"
    >
      <Icon size={16} className="text-gray-400 hover:text-gray-200" />
    </a>
  )
}

interface CRMDataTableProps {
  data: CRMClient[]
  onEdit: (client: CRMClient) => void
  onDelete: (id: string) => void
  onAddClient: () => void
  loading?: boolean
}

export function CRMDataTable({ data, onEdit, onDelete, onAddClient, loading }: CRMDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<CRMClient>[] = [
    {
      accessorKey: "channel_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Channel Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-white">{row.getValue("channel_name")}</div>
      ),
    },
    {
      accessorKey: "subscribers",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Subscribers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const subscribers = parseInt(row.getValue("subscribers"))
        const formatted = new Intl.NumberFormat().format(subscribers)
        return <div className="text-gray-300">{formatted}</div>
      },
    },
    {
      id: "social_links",
      header: "Social Links",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex gap-1">
            <SocialIcon platform="youtube" url={client.social_links.youtube} />
            <SocialIcon platform="instagram" url={client.social_links.instagram} />
            <SocialIcon platform="twitter" url={client.social_links.twitter} />
            <SocialIcon platform="tiktok" url={client.social_links.tiktok} />
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string
        return email ? (
          <a 
            href={`mailto:${email}`} 
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            {email}
          </a>
        ) : (
          <span className="text-gray-500">—</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "client_details",
      header: "Client Details",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="max-w-xs">
            <div className="font-medium text-white">{client.client_details.name}</div>
            {client.client_details.company && (
              <div className="text-sm text-gray-400">{client.client_details.company}</div>
            )}
            {client.client_details.phone && (
              <div className="text-sm text-gray-400">{client.client_details.phone}</div>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const client = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(client.id)}
              >
                Copy client ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(client.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">CRM Clients</CardTitle>
          <RainbowButton onClick={onAddClient}>
            Add Client
          </RainbowButton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter channels..."
            value={(table.getColumn("channel_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("channel_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader className="bg-gray-700/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-gray-700">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-300"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-gray-700 hover:bg-gray-700/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-gray-200">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-400"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-gray-400">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}