// Espera o conteúdo da página carregar
document.addEventListener("DOMContentLoaded", () => {
    
    // Pega os elementos do HTML
    const registerForm = document.getElementById("register-form");
    const senhaInput = document.getElementById("senha");
    const confirmarSenhaInput = document.getElementById("confirmarSenha");
    const errorMessage = document.getElementById("error-message");

    // Adiciona um "ouvinte" para quando o usuário tentar enviar o formulário
    registerForm.addEventListener("submit", (event) => {
        // 1. Previne o formulário de recarregar a página (comportamento padrão)
        event.preventDefault(); 
        
        // 2. Pega os valores digitados
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        // 3. A LÓGICA DE VALIDAÇÃO:
        if (senha !== confirmarSenha) {
            // Se as senhas forem diferentes, mostra o erro
            errorMessage.textContent = "Erro: As senhas não conferem!";
        } else {
            // Se estiverem corretas
            errorMessage.textContent = ""; // Limpa a mensagem de erro
            
            alert("Conta criada com sucesso!"); // Dá um alerta de sucesso
            
            // NO FUTURO: Aqui você enviaria os dados para um Banco de Dados
            
            // Redireciona o usuário para a tela de login
            window.location.href = "login.html";
        }
    });
});