"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Search, Menu, AlertCircle, Loader2, Plus, FileCode, MoreHorizontal, Edit, Trash2, Users } from "lucide-react"
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
import { CreateProtocolDialog } from "@/components/admin/create-protocol-dialog"
import { getAuthToken } from "@/lib/auth"

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
  const [createProtocolDialogOpen, setCreateProtocolDialogOpen] = useState(false)
  const [protocols, setProtocols] = useState<any[]>([])
  const [filteredProtocols, setFilteredProtocols] = useState<any[]>([])

  // Estados de formularios
  const [uploadForm, setUploadForm] = useState({
    category: "knowledge_base",
    description: "",
    priority: 1,
    files: [] as File[],
    useProtocol: false,
    protocolId: null as number | null,
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

  const [createProtocolForm, setCreateProtocolForm] = useState({
    name: "",
    description: "",
    content: "",
    version: "v1",
    category: "",
    is_active: true,
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

  // Load protocols when tab changes to protocols
  useEffect(() => {
    if (activeTab === "protocols") {
      fetchProtocols()
    }
  }, [activeTab])

  const fetchProtocols = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProtocols(data)
        setFilteredProtocols(data)
      }
    } catch (error) {
      console.error("Error fetching protocols:", error)
    }
  }

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

  // Filter protocols by search
  useEffect(() => {
    const filtered = protocols.filter(
      (protocol) =>
        protocol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProtocols(filtered)
  }, [searchTerm, protocols])

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
    if (!selectedCompany) return

    // Validar según el tipo de contenido
    if (uploadForm.useProtocol) {
      if (!uploadForm.protocolId) {
        alert("Debes seleccionar un protocolo")
        return
      }

      // Crear documento vinculado a protocolo
      const result = await api.linkProtocolToCompany(
        selectedCompany.id,
        uploadForm.protocolId,
        uploadForm.category,
        uploadForm.description,
        uploadForm.priority,
      )

      if (result) {
        setUploadForm({
          category: "knowledge_base",
          description: "",
          priority: 1,
          files: [],
          useProtocol: false,
          protocolId: null,
        })
        setUploadDialogOpen(false)

        // Recargar documentos
        const documents = await api.loadCompanyDocuments(selectedCompany.id)
        if (documents) setCompanyDocuments(documents)
      }
    } else {
      if (uploadForm.files.length === 0) {
        alert("Debes seleccionar al menos un archivo")
        return
      }

      const result = await api.uploadDocuments(
        selectedCompany.id,
        uploadForm.files,
        uploadForm.category,
        uploadForm.description,
        uploadForm.priority,
      )

      if (result) {
        setUploadForm({
          category: "knowledge_base",
          description: "",
          priority: 1,
          files: [],
          useProtocol: false,
          protocolId: null,
        })
        setUploadDialogOpen(false)

        // Recargar documentos
        const documents = await api.loadCompanyDocuments(selectedCompany.id)
        if (documents) setCompanyDocuments(documents)
      }
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

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createProtocolForm),
      })

      if (response.ok) {
        // Reset form and close dialog
        setCreateProtocolForm({
          name: "",
          description: "",
          content: "",
          version: "v1",
          category: "",
          is_active: true,
        })
        setCreateProtocolDialogOpen(false)

        // Reload protocols list
        await fetchProtocols()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || "Error al crear protocolo"}`)
      }
    } catch (error) {
      console.error("Error creating protocol:", error)
      alert("Error al crear protocolo")
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
                    {activeTab === "dashboard"
                      ? "Dashboard"
                      : activeTab === "protocols"
                        ? "Protocolos Centralizados"
                        : "Gestión de subagentes"}
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

          {activeTab === "protocols" && (
            <div className="space-y-6">
              {/* Header con botón crear */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Gestiona protocolos reutilizables para múltiples sub-agentes
                  </p>
                </div>
                <Button
                  onClick={() => setCreateProtocolDialogOpen(true)}
                  className="bg-[#0000FF] hover:bg-[#0000DD]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Protocolo
                </Button>
              </div>

              {/* Buscador */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar protocolos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Card con lista de protocolos */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Biblioteca de Protocolos ({filteredProtocols.length})
                  </h3>

                  {filteredProtocols.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{searchTerm ? "No se encontraron protocolos" : "No hay protocolos creados aún"}</p>
                      <p className="text-sm mt-2">Crea un protocolo para reutilizarlo en múltiples sub-agentes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProtocols.map((protocol) => (
                        <div
                          key={protocol.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <FileCode className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{protocol.name}</h4>
                                <Badge variant="secondary" className="text-xs">{protocol.version}</Badge>
                                {protocol.category && (
                                  <Badge variant="outline" className="text-xs">{protocol.category}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{protocol.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {protocol.usage_count || 0} sub-agentes
                            </div>
                            <Badge variant={protocol.is_active ? "default" : "secondary"}>
                              {protocol.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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

      <CreateProtocolDialog
        open={createProtocolDialogOpen}
        onOpenChange={setCreateProtocolDialogOpen}
        form={createProtocolForm}
        setForm={setCreateProtocolForm}
        onSubmit={handleCreateProtocol}
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
