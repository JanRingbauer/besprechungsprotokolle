namespace at.clouddna;

using {managed} from '@sap/cds/common';

/* view CatProtTree{
    key nodeID: UUID;
    name: String;
    hierarchyLevel: Integer;
} */

entity Categories : managed {
        @sap.hierarchy.node.for       : 'nodeID'
    key nodeID         : UUID;
        name           : String;

        @sap.hierarchy.level.for      : 'nodeID'
        hierarchyLevel : Integer;
        isNoteItem     : Boolean;
        deleted        : Boolean;

        @sap.hierarchy.parent.node.for: 'nodeID'
        parentNode     : Association to Categories;

        @sap.hierarchy.drill.state.for: 'nodeID'
        drillState     : String;
        protocols      : Association to many Protocols
                             on protocols.node = $self;
}

entity Protocols : managed {
    key ID               : UUID;
        node             : Association to Categories;
        name             : String;
        kunde            : String;
        date             : Date;
        time             : Time;
        teilnehmer       : String;
        protokollfuehrer : String;
        deleted          : Boolean;
        fields           : Association to many ProtocolFields
                               on fields.protocol = $self;
        tagesthemen      : Association to many Tagesthemen
                               on tagesthemen.protocol = $self;
        zusammenfassung  : String;
        todo             : Association to many ToDo
                               on todo.protocol = $self;
        documents        : Association to many Documents
                               on documents.protocol = $self;
        protocol2tag     : Association to many Tags2Protocols
                               on protocol2tag.protocol = $self
}

entity ProtocolFields : managed {
    key ID          : UUID;
        protocol    : Association to Protocols;
        label       : String;
        dataType    : DataType;
        controlType : String;
        value       : String;
}

entity Tagesthemen : managed {
    key ID       : UUID;
        protocol : Association to Protocols;
        index    : Integer not null;
        title    : String;
        inhalt   : String;
}

entity ToDo : managed {
    key ID       : UUID;
        protocol : Association to Protocols;
        erledigt : Boolean;
        aufgabe  : String;
}

entity Documents : managed {
    key ID       : UUID;
        protocol : Association to Protocols;
        name     : String;
        path     : String;
        content  : String;
}

entity ChangeHistory : managed {
    key ID         : UUID;
        protocol   : Association to Protocols;
        change     : String;
        changeUser : String;
        changeDate : String;
}

entity Tags2Protocols : managed {
    key tag      : Association to Tags;
    key protocol : Association to Protocols;
}

entity Tags : managed {
    key ID           : UUID;
        name         : String;
        tag2protocol : Association to many Tags2Protocols
                           on tag2protocol.tag = $self;
}

type DataType : String enum {
    String = 'string';
    Number = 'number';
    Date   = 'date';
}
