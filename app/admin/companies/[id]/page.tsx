"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CompanyDetails } from "@/components/admin/company-details"
import { useAdminApi, Company } from "@/hooks/use-admin-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CompanyDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { loadCompanyDetails, loadCompanyDocuments } = useAdminApi()

    const [company, setCompany] = useState<Company | null>(null)
    const [documentsCount, setDocumentsCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return

            try {
                const companyId = params.id as string
                const [details, documents] = await Promise.all([
                    loadCompanyDetails(companyId),
                    loadCompanyDocuments(companyId)
                ])

                setCompany(details)
                if (documents) {
                    setDocumentsCount(documents.length)
                }
            } catch (error) {
                console.error("Error fetching company details:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetails()
    }, [params.id])

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        )
    }

    if (!company) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-muted-foreground">Compañía no encontrada</p>
                    <Button variant="outline" onClick={() => router.push("/admin/companies")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.push("/admin/companies")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">{company.name}</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <CompanyDetails
                        company={company}
                        companyDetails={company}
                        documentsCount={documentsCount}
                    />
                    {/* Add more stats or widgets here if needed */}
                </div>
            </div>
        </AdminLayout>
    )
}
