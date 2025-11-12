"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Search, Menu, AlertCircle, Loader2 } from "lucide-react"
import { getUser } from "@/lib/auth"
import { useAdminApi, type Company, type Document } from "@/hooks/use-admin-api"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentCompanies } from "@/components/admin/recent-companies"
import { CompaniesList } from "@/components/admin/companies-list"
import { CompanyDetails } from "@/components/admin/company-details"
import { DocumentsList } from "@/components/admin/documents-list"
import { UploadDialog } from "@/components/admin/upload-dialog"
import { EditDocumentDialog } from "@/components/admin/edit-document-dialog"
import { CreateCompanyDialog } from "@/components/admin/create-company-dialog"

const AdminDashboard = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Estados de datos
  const [dashboard, setDashboard] = useState(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyDetails, setCompanyDetails] = useState<Company | null>(null)
  const [companyDocuments, setCompanyDocuments] = useState<Document[]>([])

  // Estados de UI
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDocumentDialogOpen, setEditDocumentDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false)

  // Estados de formularios
  const [uploadForm, setUploadForm] = useState({
    category: "knowledge_base",
    description: "",
    priority: 1,
    files: [] as File[],
  })

  const [editForm, setEditForm] = useState({
    description: "",
    priority: 1,
    category: "",
    is_active: true,
  })

  const [createCompanyForm, setCreateCompanyForm] = useState({
    name: "",
    industry: "",
    sector: "",
    description: "",
  })

  const user = getUser()
  const api = useAdminApi()

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      const [dashboardData, companiesData] = await Promise.all([api.loadDashboard(), api.loadCompanies()])

      if (dashboardData) setDashboard(dashboardData)
      if (companiesData) setCompanies(companiesData)
    }

    loadInitialData()
  }, [])

  // Cargar detalles de compañía seleccionada
  useEffect(() => {
    if (selectedCompany) {
      const loadCompanyData = async () => {
        const [details, documents] = await Promise.all([
          api.loadCompanyDetails(selectedCompany.id),
          api.loadCompanyDocuments(selectedCompany.id),
        ])

        if (details) setCompanyDetails(details)
        if (documents) setCompanyDocuments(documents)
      }

      loadCompanyData()
    }
  }, [selectedCompany])

  // Configurar formulario de edición cuando se selecciona un documento
  useEffect(() => {
    if (selectedDocument) {
      setEditForm({
        description: selectedDocument.description || "",
        priority: selectedDocument.priority || 1,
        category: selectedDocument.category || "",
        is_active: selectedDocument.is_active !== undefined ? selectedDocument.is_active : true,
      })
    }
  }, [selectedDocument])

  // Handlers
  const handleUploadDocuments = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || uploadForm.files.length === 0) return

    const result = await api.uploadDocuments(
      selectedCompany.id,
      uploadForm.files,
      uploadForm.category,
      uploadForm.description,
      uploadForm.priority,
    )

    if (result) {
      setUploadForm({ category: "knowledge_base", description: "", priority: 1, files: [] })
      setUploadDialogOpen(false)

      // Recargar documentos
      const documents = await api.loadCompanyDocuments(selectedCompany.id)
      if (documents) setCompanyDocuments(documents)
    }
  }

  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocument || !selectedCompany) return

    const result = await api.updateDocument(selectedCompany.id, selectedDocument.id, editForm)

    if (result) {
      setEditDocumentDialogOpen(false)

      // Recargar documentos
      const documents = await api.loadCompanyDocuments(selectedCompany.id)
      if (documents) setCompanyDocuments(documents)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) return
    if (!selectedCompany) return

    const result = await api.deleteDocument(selectedCompany.id, documentId)

    if (result) {
      // Recargar documentos
      const documents = await api.loadCompanyDocuments(selectedCompany.id)
      if (documents) setCompanyDocuments(documents)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await api.createCompany({
      name: createCompanyForm.name,
      industry: createCompanyForm.industry,
      sector: createCompanyForm.sector,
      description: createCompanyForm.description,
    })

    if (result) {
      console.log("[v0] Company created successfully:", result)
      // Reset form and close dialog
      setCreateCompanyForm({
        name: "",
        industry: "",
        sector: "",
        description: "",
      })
      setCreateCompanyDialogOpen(false)

      // Reload companies list
      const companiesData = await api.loadCompanies()
      if (companiesData) setCompanies(companiesData)
    }
  }

  // Filtrar compañías
  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar móvil */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
        </SheetContent>
      </Sheet>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div>
                  <h1 className="font-bold text-2xl text-blue-600">
                    {activeTab === "dashboard" ? "Dashboard" : "Gestión de subagentes"}
                  </h1>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs text-blue-600 bg-cyan-400">
              Admin
            </Badge>
          </div>
        </div>

        {/* Error display */}
        {api.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{api.error}</p>
                <button
                  onClick={() => api.setError(null)}
                  className="text-red-600 hover:text-red-500 text-sm underline ml-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido */}
        <ScrollArea className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {api.loading && !dashboard ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <DashboardStats dashboard={dashboard} />
                  {dashboard?.recent_companies && <RecentCompanies companies={dashboard.recent_companies} />}
                </>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div className="space-y-6">
              {/* Buscador */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en subagentes"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {api.loading && companies.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CompaniesList
                    companies={filteredCompanies}
                    selectedCompany={selectedCompany}
                    onSelectCompany={setSelectedCompany}
                    onAddCompany={() => setCreateCompanyDialogOpen(true)}
                  />

                  <div className="space-y-4">
                    <CompanyDetails
                      company={selectedCompany}
                      companyDetails={companyDetails}
                      documentsCount={companyDocuments.length}
                    />

                    {selectedCompany && (
                      <DocumentsList
                        documents={companyDocuments}
                        loading={api.loading}
                        onUpload={() => setUploadDialogOpen(true)}
                        onEdit={(doc) => {
                          setSelectedDocument(doc)
                          setEditDocumentDialogOpen(true)
                        }}
                        onDelete={handleDeleteDocument}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <CreateCompanyDialog
        open={createCompanyDialogOpen}
        onOpenChange={setCreateCompanyDialogOpen}
        form={createCompanyForm}
        setForm={setCreateCompanyForm}
        onSubmit={handleCreateCompany}
        loading={api.loading}
      />

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        form={uploadForm}
        setForm={setUploadForm}
        onSubmit={handleUploadDocuments}
        loading={api.loading}
      />

      <EditDocumentDialog
        open={editDocumentDialogOpen}
        onOpenChange={setEditDocumentDialogOpen}
        document={selectedDocument}
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleUpdateDocument}
        loading={api.loading}
      />
    </div>
  )
}

export default AdminDashboard
