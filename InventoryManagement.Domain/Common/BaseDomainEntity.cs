using System.Collections.Generic;

namespace InventoryManagement.Domain.Common
{
    public interface IHasDomainEvents
    {
        IReadOnlyList<IDomainEvent> DomainEvents { get; }
        void ClearDomainEvents();
    }

    public abstract class BaseDomainEntity : IHasDomainEvents
    {
        private readonly List<IDomainEvent> _domainEvents = new();
        
        public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        protected void AddDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }
    }
}
