import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext.jsx";
import { useContext, useState } from "react";
import {
    AuthLayout,
    Field,
    PasswordField,
    SubmitButton,
    Alert,
} from "./authUi.jsx";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(credentials);
            navigate("/");
        } catch {
            setError("Usuario o contraseña inválidos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            accent="volt"
            brand={{
                img: "/img/mbappe-psg.png",
                eyebrow: "Bienvenido de nuevo",
                line1: "El juego",
                line2: "te espera",
                ghost: "LIGA",
            }}
        >
            <p className="eyebrow text-volt mb-2">Acceso</p>
            <h1 className="display-giant text-4xl sm:text-5xl text-white mb-7">
                Iniciar <span className="text-volt italic-skew">sesión</span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Field
                    label="Email"
                    icon="mail"
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    required
                />
                <PasswordField
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                />

                {error && <Alert>{error}</Alert>}

                <SubmitButton loading={loading} loadingText="Ingresando...">
                    Iniciar sesión
                </SubmitButton>
            </form>

            <div className="mt-7 pt-6 border-t border-line flex items-center justify-between gap-3 flex-wrap text-sm">
                <span className="text-[#8a8a82]">¿No tenés cuenta?</span>
                <Link
                    to="/register"
                    className="text-volt hover:text-white font-display font-600 uppercase tracking-wider text-[13px] transition-colors"
                >
                    Registrate →
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
