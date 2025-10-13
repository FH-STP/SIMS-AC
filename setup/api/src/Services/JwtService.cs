using sims.Models;
using sims;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace sims.Services
{

    public class JwtService
    {
        public JwtService(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        private readonly IConfiguration Configuration;

        public async Task<LoginResponse?> Authenticate(LoginRequest request, String userOrAdmin)
        {
            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.UserName) || (request.ID==null))
            {
                return null;
            }

            var Issuer = Configuration["JwtConfig:Issuer"];
            var Audience = Configuration["JwtConfig:Audience"];
            var Key = Configuration["JwtConfig:Key"];
            var TokenValidityMins = Configuration.GetValue<int>("JwtConfig:TokenValidityMins");
            var TokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(TokenValidityMins);

            var TokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Name, request.UserName),
                    new Claim(ClaimTypes.Role, userOrAdmin)
                }),
                Expires = TokenExpiryTimeStamp,
                Issuer = Issuer,
                Audience = Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Key)), SecurityAlgorithms.HmacSha512Signature),
            };

            var TokenHandler = new JwtSecurityTokenHandler();
            var SecurityToken = TokenHandler.CreateToken(TokenDescriptor);
            var AccessToken = TokenHandler.WriteToken(SecurityToken);


            return new LoginResponse
            {
                ID=request.ID,
                UserName = request.UserName,
                AccessToken = AccessToken,
                ExpiresIn = (int)TokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds
            };
        }
    }
}
