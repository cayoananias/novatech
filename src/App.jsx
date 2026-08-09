import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAdmin, RequireAuth } from './components/ProtectedRoute'
import { AdminPage } from './pages/AdminPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AppLayout />}>
					<Route index element={<HomePage />} />
					<Route path="produtos" element={<ProductsPage />} />
					<Route path="produto/:id" element={<ProductDetailPage />} />
					<Route path="carrinho" element={<CartPage />} />
					<Route path="contato" element={<ContactPage />} />
					<Route
						path="perfil"
						element={
							<RequireAuth>
								<ProfilePage />
							</RequireAuth>
						}
					/>
					<Route
						path="checkout"
						element={
							<RequireAuth>
								<CheckoutPage />
							</RequireAuth>
						}
					/>
				</Route>

				<Route path="login" element={<LoginPage />} />
				<Route path="cadastro" element={<RegisterPage />} />
				<Route
					path="admin"
					element={
						<RequireAdmin>
							<AdminPage />
						</RequireAdmin>
					}
				/>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}