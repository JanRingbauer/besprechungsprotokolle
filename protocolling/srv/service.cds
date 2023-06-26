using {at.clouddna as db} from '../db/schema';

service ProtocollingService @(path: '/protocolling') {
    entity Categories     as projection on db.Categories;

    entity Protocols      as projection on db.Protocols excluding {
        createdAt,
        createdBy,
        modifiedAt,
        modifiedBy
    };

    entity ProtocolFields as projection on db.ProtocolFields;
    entity Tagesthemen    as projection on db.Tagesthemen;
    entity ToDo           as projection on db.ToDo;
    entity Documents      as projection on db.Documents;
    entity ChangeHistory  as projection on db.ChangeHistory;
    entity Tags2Protocols as projection on db.Tags2Protocols;
    entity Tags           as projection on db.Tags;

    view CatProtTree as
            select
                key c.nodeID         as nodeID,
                    c.name           as name,
                    c.parentNode     as parentNode,
                    c.hierarchyLevel as hierarchyLevel,
                    c.drillState     as drillState,
                    c.isNoteItem     as isNoteItem
            from Categories as c
        union
            select
                key p.ID   as nodeID,
                    p.name as name,
                    p.node as parentNode,
                    '2'    as hierarchyLevel,
                    'leaf' as drillState,
                    true   as isNoteItem
            from Protocols as p;
// action upShift(selected : UUID);
// action downShit(selected : UUID);
}
