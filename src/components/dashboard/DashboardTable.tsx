"use client";

import { useState, useMemo, useEffect } from "react";
import type { JSX } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
  FiEye,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
// Shadcn imports
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { LuListFilter } from "react-icons/lu";
import { SlCloudDownload } from "react-icons/sl";
import { GoDotFill } from "react-icons/go";
import { FaRegSmile, FaRegMeh } from "react-icons/fa";
import { ImConfused } from "react-icons/im";
import { PiSmileySadBold, PiSmileyAngry } from "react-icons/pi";
import { BiDizzy } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  useAdminMarkersStore,
  AdminMarker,
} from "../../store/useAdminMarkersStore";
import { useNavigate } from "react-router-dom";
import { useModalStore } from "../../store/useModalStore";
import { updateReportStatus, deleteReport } from "../../services/reports";
import { ReportStatus } from "../../types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Types
interface CitizenFeedback {
  id: string;
  name: string;
  incidentAddress: string;
  assessment:
    | "positive"
    | "negative"
    | "neutral"
    | "confused"
    | "sad"
    | "angry"
    | "surprised";
  incidentType: string;
  reportMessage: string;
  adjunct: string;
  status: "active" | "closed";
}

// Feeling to assessment mapping
const feelingToAssessment = (
  feeling: string
): CitizenFeedback["assessment"] => {
  // Map different feelings to your original assessment types
  switch (feeling.toLowerCase()) {
    case "positive":
      return "positive";
    case "confused":
      return "confused";
    case "sad":
      return "sad";
    case "angry":
      return "angry";
    case "surprised":
      return "surprised";
    case "negative":
      return "negative";
    default:
      return "neutral";
  }
};

const reactions: Record<string, JSX.Element> = {
  positive: <FaRegSmile size={30} className="text-blue-600" />,
  neutral: <FaRegMeh size={30} className="text-blue-600" />,
  confused: <ImConfused size={30} className="text-blue-600" />,
  sad: <PiSmileySadBold size={30} className="text-blue-600 " />,
  angry: <PiSmileyAngry size={30} className="text-blue-600 " />,
  surprised: <BiDizzy size={30} className="text-blue-600 " />,
  negative: <PiSmileySadBold size={30} className="text-blue-600" />,
};

// Utils
const getAssessmentBadge = (assessment: string) => {
  return <div>{reactions[assessment] || reactions["neutral"]}</div>;
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    active:
      "bg-[#D6EAFF] text-[#007AFF] border border-blue-200 px-4 py-2 rounded-full flex items-center gap-2",
    closed:
      "bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2",
  };

  const dotColors: Record<string, string> = {
    active: "text-[#007AFF]",
    closed: "text-gray-500",
  };

  return (
    <Badge className={variants[status]}>
      <GoDotFill className={`h-4 w-4 ${dotColors[status]}`} />
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

// Component
export default function DashboardTable() {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { markers: adminMarkers, fetchMarkers } = useAdminMarkersStore();
  const navigate = useNavigate();
  const { setLocationDetailsModalOpen } = useModalStore();

  useEffect(() => {
    // Call fetchMarkers when the component mounts
    fetchMarkers();
  }, [fetchMarkers]);

  // Transform adminMarkers data to CitizenFeedback format
  const data: CitizenFeedback[] = useMemo(() => {
    if (!adminMarkers || adminMarkers.length === 0) {
      return [];
    }

    return adminMarkers.map((marker: AdminMarker) => ({
      id: marker.id,
      name:
        `${marker.firstName || ""} ${marker.lastName || ""}`.trim() ||
        "Unknown User",
      incidentAddress: marker.location?.address || "Address not available",
      assessment: feelingToAssessment(marker.feeling || "neutral"),
      incidentType: marker.category || "General",
      reportMessage: marker.reportText || "No message provided",
      adjunct: "Document attachment",
      status: marker.reportStatus === "New" ? "active" : "closed",
    }));
  }, [adminMarkers]);

  console.log("adminMarkers :", adminMarkers);
  console.log("transformed data :", data);

  // const { data: heatMapData } = useHeatmapStore();
  // console.log(heatMapData);

  const columns: ColumnDef<CitizenFeedback>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            Nom Complet
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-semibold text-gray-900">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "incidentAddress",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.incidentAddress')}
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("incidentAddress")}</div>
        ),
      },
      {
        accessorKey: "assessment",
        header: () => (
          <Button
            variant="ghost"
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.assessment')}
          </Button>
        ),
        cell: ({ row }) => getAssessmentBadge(row.getValue("assessment")),
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        accessorKey: "incidentType",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.incidentType')}
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("incidentType")}</div>
        ),
      },
      {
        accessorKey: "reportMessage",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.reportMessage')}
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate text-gray-700">
            {row.getValue("reportMessage")}
          </div>
        ),
      },
      {
        accessorKey: "adjunct",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.adjunct')}
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-gray-700">{row.getValue("adjunct")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold text-gray-500 hover:bg-transparent"
          >
            {t('Dashboard.Table.columns.status')}
            {column.getIsSorted() === "asc" ? (
              <FiChevronUp className="ml-2 h-4 w-4 text-blue-600" />
            ) : // <LuArrowDown className="ml-2 h-4 w-4 text-gray-500" />
            column.getIsSorted() === "desc" ? (
              <FiChevronDown className="ml-2 h-4 w-4 text-blue-600" />
            ) : null}
          </Button>
        ),
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <FiMoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleViewReport(row.original.id)}
              >
                <FiEye className="mr-2 h-4 w-4 text-blue-600" />
                {t('Dashboard.Table.actions.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditReport(row.original.id)}
              >
                <FiEdit className="mr-2 h-4 w-4 text-blue-600" />
                {t('Dashboard.Table.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteReport(row.original.id)}
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                {t('Dashboard.Table.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: { rowSelection, sorting, columnFilters, globalFilter },
  });

  const assessmentFilter =
    (columnFilters.find((f) => f.id === "assessment")?.value as string[]) || [];
  const statusFilter =
    (columnFilters.find((f) => f.id === "status")?.value as string[]) || [];

  const handleAssessmentFilter = (value: string) => {
    const newFilter = assessmentFilter.includes(value)
      ? assessmentFilter.filter((v) => v !== value)
      : [...assessmentFilter, value];
    table.getColumn("assessment")?.setFilterValue(newFilter);
  };

  const handleStatusFilter = (value: string) => {
    const newFilter = statusFilter.includes(value)
      ? statusFilter.filter((v) => v !== value)
      : [...statusFilter, value];
    table.getColumn("status")?.setFilterValue(newFilter);
  };

  // Action handlers
  const handleViewReport = (reportId: string) => {
    // Find the marker in adminMarkers
    const marker = adminMarkers.find((m) => m.id === reportId);
    if (marker) {
      // Navigate to home page
      navigate("/");
      // Set the marker in the store for the modal
      // We'll need to set this in a way that the home page can access it
      // For now, we'll use localStorage as a temporary solution
      localStorage.setItem("selectedMarkerId", reportId);
      // Open the location details modal
      setLocationDetailsModalOpen(true);
    }
  };

  const handleEditReport = async (reportId: string) => {
    const marker = adminMarkers.find((m) => m.id === reportId);
    if (!marker) return;

    const newStatus: ReportStatus =
      marker.reportStatus === "New" ? "Closed" : "New";

    try {
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        toast.success(t('Dashboard.Table.toast.statusUpdated', { status: newStatus }));
        // Refresh the markers
        await fetchMarkers();
      } else {
        toast.error(result.error || t('Dashboard.Table.toast.statusUpdateFailed'));
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error(t('Dashboard.Table.toast.statusUpdateFailed'));
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const marker = adminMarkers.find((m) => m.id === reportId);
    if (!marker) return;

    const confirmDelete = window.confirm(
      t('Dashboard.Table.confirmDelete', { name: `${marker.firstName} ${marker.lastName}` })
    );

    if (!confirmDelete) return;

    try {
      const result = await deleteReport(reportId);
      if (result.success) {
        toast.success(t('Dashboard.Table.toast.deleted'));
        // Refresh the markers
        await fetchMarkers();
      } else {
        toast.error(result.error || t('Dashboard.Table.toast.deleteFailed'));
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error(t('Dashboard.Table.toast.deleteFailed'));
    }
  };

  // Show loading state if data is not yet available
  if (!adminMarkers) {
    return (
      <div className="w-full space-y-4 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen space-y-4 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row items-center justify-between">
        <div>
          <div className="flex items-baseline gap-5  ">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('Dashboard.Table.title')}
            </h1>
            <h2 className="text-[#0070FF] bg-[#F7FAFF] p-3 rounded-md">
              {t('Dashboard.Table.incidents')}
            </h2>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {t('Dashboard.Table.subtitle')}
          </p>
        </div>
        <Input
          placeholder={t('Dashboard.Table.searchAllFields')}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-gray-700">
            {/* <FiFilter className="mr-2 h-4 w-4" /> */}
            <LuListFilter className="mr-2 h-4 w-4" />
            {t('Dashboard.Table.filters')}
          </Button>
          <Button variant="customBlue" size="sm">
            {/* <FiDownload className="mr-2 h-4 w-4" /> */}
            <SlCloudDownload className="mr-2 h-4 w-4" />
            {t('Dashboard.Table.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* <Select onValueChange={handleAssessmentFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Valoración" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="positive">Positiva</SelectItem>
                        <SelectItem value="negative">Negativa</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                </Select> */}

        {/* <Select onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                </Select> */}

        {(assessmentFilter.length > 0 || statusFilter.length > 0) && (
          <Button
            variant="ghost"
            onClick={() => {
              table.getColumn("assessment")?.setFilterValue([]);
              table.getColumn("status")?.setFilterValue([]);
            }}
            className="h-8 px-2 lg:px-3"
          >
            {t('Dashboard.Table.clearFilters')}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <div className="flex  gap-2 flex-wrap">
        {assessmentFilter.map((value) => (
          <Badge key={value} variant="secondary" className="text-xs">
            Valoración: {value}
            <button
              onClick={() => handleAssessmentFilter(value)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </Badge>
        ))}
        {statusFilter.map((value) => (
          <Badge key={value} variant="secondary" className="text-xs">
            Estado: {value}
            <button
              onClick={() => handleStatusFilter(value)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border max-w-full overflow-x-scroll border-gray-200 bg-white shadow-sm">
        <table className="w-full overflow-x-scroll">
          {/* this is the head */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 bg-gray-50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-gray-900"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {/* This is the table body */}
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    row.getIsSelected() ? "bg-blue-50 hover:bg-blue-100" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  {t('Dashboard.Table.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {t('Dashboard.Table.selectedRows', { selected: table.getFilteredSelectedRowModel().rows.length, total: table.getFilteredRowModel().rows.length })}
        </div>
        <div className="text-sm text-gray-500">
          {t('Dashboard.Table.showingEntries', { shown: table.getRowModel().rows.length, total: data.length })}
        </div>
      </div>
    </div>
  );
}
