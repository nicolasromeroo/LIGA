import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { AuthContext } from "../../Contexts/AuthContext.jsx";
import {
    AuthLayout,
    Field,
    PasswordField,
    SubmitButton,
    Alert,
} from "./authUi.jsx";

const Register = () => {
    const { login } = useContext(AuthContext);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (form.username.trim().length < 3)
            return "El nombre de usuario debe tener al menos 3 caracteres.";
        if (form.password.length < 6)
            return "La contraseña debe tener al menos 6 caracteres.";
        if (form.password !== form.confirm)
            return "Las contraseñas no coinciden.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const invalid = validate();
        if (invalid) {
            setError(invalid);
            return;
        }

        setLoading(true);
        try {
            // El rol lo asigna el servidor (siempre USER): acá no se elige.
            await authApi.register({
                name: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            setSuccess("¡Cuenta creada! Entrando...");
            try {
                // Auto-login para que no tenga que volver a escribir todo.
                await login({ email: form.email.trim(), password: form.password });
                navigate("/");
            } catch {
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Ocurrió un error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            accent="gold"
            brand={{
                img: "/img/lewi.png",
                imgClass:
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[85%] object-contain opacity-90 drop-shadow-[0_30px_60px_rgba(0,0,0,.7)]",
                overlay: "bg-stripes",
                eyebrow: "Sumate al juego",
                line1: "Armá tu",
                line2: "leyenda",
                ghost: "2026",
            }}
        >
            <p className="eyebrow text-volt mb-2">Registro</p>
            <h1 className="display-giant text-4xl sm:text-5xl text-white mb-3">
                Crear <span className="text-volt italic-skew">cuenta</span>
            </h1>
            <p className="text-sm text-[#8a8a82] mb-7">
                Arrancás con <span className="text-gold font-stat font-700">1.000 pts</span> para
                abrir tus primeros sobres.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field
                    label="Usuario"
                    icon="user"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="futbolero10"
                    autoComplete="username"
                    spellCheck={false}
                    maxLength={30}
                    required
                />
                <Field
                    label="Email"
                    icon="mail"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    required
                />
                <PasswordField
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                />
                <PasswordField
                    label="Confirmar contraseña"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Repetí la contraseña"
                    autoComplete="new-password"
                    required
                />

                {error && <Alert>{error}</Alert>}
                {success && <Alert type="success">{success}</Alert>}

                <SubmitButton loading={loading} loadingText="Creando cuenta...">
                    Crear cuenta gratis
                </SubmitButton>

                <p className="text-[11px] text-[#6b6b64] text-center leading-relaxed">
                    Al registrarte aceptás las reglas de juego limpio de LIGA.
                </p>
            </form>

            <div className="mt-6 pt-6 border-t border-line flex items-center justify-between gap-3 flex-wrap text-sm">
                <span className="text-[#8a8a82]">¿Ya tenés cuenta?</span>
                <Link
                    to="/login"
                    className="text-volt hover:text-white font-display font-600 uppercase tracking-wider text-[13px] transition-colors"
                >
                    Iniciá sesión →
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Register;
